import { Date } from 'mongoose';
import { successMessage } from '../constants/CommonMessages';
import { BadRequestError } from '../errors/bad-request-error';
import { TransUnion } from '../Integrations/Implementaion/TransUnion';
import { DataRecord, DataRecordDoc } from '../models/data-record';
import { Integration, IntegrationDoc, Integrations, IntegrationType } from '../models/integration';
import { Edge, Node, NodeType, Workflow, WorkflowDoc } from '../models/workflow'
import { WorkflowInstance, WorkflowInstanceDoc, WorkflowStatus } from '../models/workflow-instance'
import { WorkflowStep, WorkflowStepDoc } from '../models/workflow-step';
import { CRUDManager } from './CRUDManager';
import { JSONRULE, WorkflowRuleEngine } from './WorkflowRuleEngine';
import { Trustloop } from "../Integrations/Implementaion/Trustloop";
import { Datamodel, DatamodelDoc } from "../models/data-model";
import { ZohoSign } from '../Integrations/Implementaion/ZohoSign';
import { Company } from "../models/company";
import { Twilio } from '../Integrations/Implementaion/Twilio';
import { Note, referenceType } from '../models/note';
import axios from 'axios'
import { notfication } from '../helper/notification';
import { ObjectId } from  'mongodb';
import { WebhookEvent } from '../models/webhook-events';
import { Webhook } from '../models/webhook';
import { activity } from '../helper/activity';

export class WorkflowManager {

    // record ids
    recordId: string
    // workflow config
    workflowConfig: WorkflowDoc | null = null
    // workflow instance
    workflowInstance: WorkflowInstanceDoc | null = null
    // current step
    currentStep: WorkflowStepDoc | null = null
    // node map
    nodes: Map<string, Node>;
    // edge map
    edges: Map<string, Edge>;
    // variable map
    // constant map
    // formula map
    // result map
    nodeResult: Map<string, any>;
    company_id:string | undefined;
    user_id:string | undefined;
    intervalId: ReturnType<typeof setTimeout> | null = null;
    private checkInterval: number = 0;
    consentRecordId:string  =  '';

    constructor(recordId: string ='') {
        this.nodes = new Map<string, Node>();
        this.edges = new Map<string, Edge>();
        this.recordId = recordId;
        this.nodeResult = new Map<string, any>();
        this.consentRecordId = '';

    }
    async run(workflowId: string, company_id?:string, user_id?:string) { 
        this.company_id = company_id;
        this.user_id = user_id;
        this.workflowConfig = await Workflow.findById(workflowId);
        if (!this.workflowConfig || !this.workflowConfig.config) {
            await notfication(this.company_id, this.user_id, "workflow", "Something went wrong while running the workflow " +workflowId, '');
            throw new BadRequestError('Invalid Workflow Configuration')
        }

        if (!this.workflowConfig.isActive) {
            await notfication(company_id, user_id, "workflow", "Workflow "+workflowId+" is deactivated", '');
            throw new BadRequestError('Workflow is deactivated')
        }

        // create instance of workflow
        this.workflowInstance = WorkflowInstance.build({
            recordId: this.recordId,
            workflow: this.workflowConfig.id,
            company: this.workflowConfig.company,
            status: WorkflowStatus.inProgress,
            result: '',
            startedAt: Date.now() as unknown as Date
        });
        await this.workflowInstance.save();

        // create map of edge and node
        for (let node of this.workflowConfig.config.nodes) {
            this.nodes.set(node.id, node)
        }
        for (let edge of this.workflowConfig.config.edges) {
            if (edge.sourceHandle) {
                this.edges.set(edge.source + edge.sourceHandle, edge)
            }
            else {
                this.edges.set(edge.source, edge)
            }

        }
        // start with the initial node

        // get start node
        let nextNode = this.getNextNode(null);
        console.log("getnextnode================125412=====================",nextNode)
        const lastNode: any = await this.nodeTraversal(nextNode);
        // update workflow instance status
        if (lastNode != undefined) {
            if (this.currentStep && this.currentStep.status === 'Error' && this.currentStep.type !== 'actionNode' ){
                await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with " +this.currentStep.label+ " node, " + this.currentStep.data.stepData.label+ " for workflow " +workflowId+" , workflow paused due to Error response",this.workflowInstance?._id);
                if(this.currentStep && this.workflowInstance) await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                
            } else {
                this.workflowInstance.status = WorkflowStatus.paused;
            }
        }
        else {
            this.workflowInstance.status = WorkflowStatus.completed;
        }
        this.workflowInstance.result = JSON.stringify(Array.from(this.nodeResult.entries()));
        await this.workflowInstance.save();
    }

    async resume(nodeId: string, workflowId?: string, workflowInstanceId?: string, workflowStepId?: string) {
        console.log("into resume=================================",nodeId)
        if(workflowId && workflowInstanceId && workflowStepId) {
            this.workflowConfig = await Workflow.findById(workflowId);
            if (!this.workflowConfig || !this.workflowConfig.config) {
                throw new BadRequestError('Invalid Workflow Configuration')
            }
            
            if (!this.workflowConfig.isActive) throw new BadRequestError('Workflow is deactivated')    
            for (let node of this.workflowConfig.config.nodes) {
                this.nodes.set(node.id, node)
            }
            for (let edge of this.workflowConfig.config.edges) {
                if (edge.sourceHandle) {
                    this.edges.set(edge.source + edge.sourceHandle, edge)
                }
                else {
                    this.edges.set(edge.source, edge)
                }
            }
            this.workflowInstance = await WorkflowInstance.findById(workflowInstanceId);
            this.currentStep = await WorkflowStep.findById(workflowStepId)
        }
        const node = this.nodes.get(nodeId);
        if (!node) {
            await notfication(this.company_id, this.user_id,"workflow", "Something went wrong with workflow: "+this.workflowConfig?.id+", Invalid Node ID for resuming", this.workflowInstance?._id) 
            throw new BadRequestError('Invalid Node ID for resuming');
        }
        if (!this.workflowInstance){
            await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with workflow: "+this.workflowConfig?.id+", No workflow data for resuming",'') 
            throw new BadRequestError('No workflow data for resuming');
        } 
        if (!this.currentStep) throw new BadRequestError('No current step available for resuming');

        let lastNode;
        if(this.currentStep.status === WorkflowStatus.error) {
            lastNode=  await this.nodeTraversal(node)
        } else {
            this.currentStep.status = WorkflowStatus.completed;
            await this.currentStep.save();
            
            let nextNode = this.getNextNode(node);
            lastNode = await this.nodeTraversal(nextNode)
        }

        if (lastNode != undefined) {
            this.workflowInstance.status = WorkflowStatus.paused;
        }
        else {
            this.workflowInstance.status = WorkflowStatus.completed;
        }
        this.workflowInstance.result = JSON.stringify(Array.from(this.nodeResult.entries()));
        await this.workflowInstance.save();
        /* Trigger workflow */
        const workflowsToRun = await Workflow.find({ _id: { $ne: new ObjectId(workflowId) }, object: this.workflowConfig?.object, isActive: true,company: this.company_id }).lean().sort({ createdAt: 1 });
        if (!workflowsToRun || workflowsToRun.length === 0) {
            await notfication(this.company_id, this.user_id, "workflow", `No active workflows found on Resume`, '');
            throw new Error(`No active workflows found`);
        }
        for (let workflow of workflowsToRun) {
            console.log("workflow-------------------1-",workflow, this.recordId)
            const workflowManager = new WorkflowManager(this.recordId);
            console.log("workflowManager------------------1-",workflowManager)
            if (await workflowManager.checkEligibility(workflow)) {
                // get workflow
                await workflowManager.run(workflow._id,this.company_id,this.user_id );
            }
        }
    }

    async nodeTraversal (nextNode: Node | null | undefined) {
        console.log("nextNode-------------------111111111111-----------------------------",nextNode)
        while (nextNode != null && nextNode != undefined) {
            console.log("-------------------nextNode-----------------------------",nextNode)

            let result = await this.executeStep(nextNode);
            // store the result in map, access using node id
            let resultSet = {
                node: nextNode,
                result: result
            }
            this.nodeResult.set(nextNode.id, resultSet);
            
            let currentNode = nextNode;
            // Pass the current node
            nextNode = this.getNextNode(nextNode);
            // If it's in wait state or encountered an error while doing action step, then pause the entire workflow
            if (currentNode.data.label === 'Wait') {
                console.log("if currentNode is wait ---------------",currentNode.data.label)
                break;
            }
            if(result && result === 'Error' && currentNode.data.label !== 'Action') {
                console.log("error--------------->>>>>>>>>>>>>>>>>",currentNode.data.label)
                if(this.currentStep && this.workflowInstance) await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                break;
            }
            // if(currentNode.data.label === 'Action'){
                
            // }
                
            console.log("ResultSet---------------------:", resultSet);
        }
        return nextNode;
    }

    private getNextNode(currentNode: Node | null) {
        console.log("currentNode------------------------------------------------",currentNode)
        console.log("this.currentStep------------------------------------------------",this.currentStep)
        if (this.currentStep != null) {
            let edge: Edge | undefined;
            if (this.currentStep.type == 'decisionNode') {
                if (currentNode) {
                    // get the result stored
                    let result = this.nodeResult.get(currentNode.id);
                    if (result.result !== false) {
                        edge = this.edges.get(this.currentStep.name + 'source_leftDecision');
                    }
                    else {
                        edge = this.edges.get(this.currentStep.name + 'source_rightDecision');
                    }
                }
            } else if (this.currentStep.type == 'actionNode') {
                if (currentNode) {
                    // get the result stored
                    let result = this.nodeResult.get(currentNode.id);
                    if(result.result === undefined) {
                        console.log("undefined--------1-------------------",result)
                        edge = this.edges.get(this.currentStep.name);
                    } else if (result.result !== false) {
                        console.log("!Error--------1-------------------",result)
                        edge = this.edges.get(this.currentStep.name + 'source_leftAction');
                    } else {
                        console.log("else--------1-------------------",result)
                        edge = this.edges.get(this.currentStep.name + 'source_rightAction');
                    }
                }
            } else {
                // get connected edge
                edge = this.edges.get(this.currentStep.name);
            }
            if (edge) {
                // get target node
                return this.nodes.get(edge.target);
            }
            else {
                return null;
            }
        }
        else {
            return this.nodes.get('start');
        }
    }

    private async executeStep(step: Node) {
        console.log("step****************************",step)
        // Create log for current node
        if(this.currentStep?.status !== WorkflowStatus.error){
            this.currentStep = WorkflowStep.build({
                label: step.data.label,
                name: step.id,
                data: step.data,
                description: step.id,
                workflowInstanceId: this.workflowInstance?.id,
                type: step.type,
                status: WorkflowStatus.inProgress,
                result: ''
            });
            await this.currentStep.save();
        }

        let stepResult;

        switch (step.type) {
            case NodeType.start:
                this.currentStep.result = "Started Successfully"
                break;
            case NodeType.end:
                this.currentStep.result = "Workflow Executed Successfully"
                break;
            case NodeType.decision:
                stepResult = await this.executeDecisionStep(step)
                console.log("Decision Result: ", stepResult);
                // this.currentStep.result = !stepResult ? stepResult : JSON.stringify((stepResult));
                break;
                case NodeType.note: 
                stepResult = await this.executeNoteStep(step)
                this.currentStep.result = JSON.stringify(stepResult);
                break;
            case NodeType.lendXP:
                stepResult = await this.executeLendXPStep(step)
                console.log("lendXP Result:", stepResult);
                this.currentStep.result = JSON.stringify(stepResult);
                break;
            case NodeType.assignment:
                break;
            case NodeType.action:
                stepResult = await this.executeActionstep(step);
                console.log("stepResult Action", stepResult);
                break;
            case NodeType.createRecord:
                const crudCreate = new CRUDManager(step, this.recordId);
                crudCreate.createRecord();
                break;
            case NodeType.getRecord:
                const crudGet = new CRUDManager(step, this.recordId);
                stepResult = await crudGet.getRecord();
                this.currentStep.result = JSON.stringify(stepResult);
                break;
            case NodeType.updateRecord:                
                const crudUpdate = new CRUDManager(step, this.recordId);
                stepResult = await crudUpdate.updateRecord(this.company_id,this.user_id);
                this.currentStep.result = JSON.stringify(stepResult);
                break;
            case NodeType.deleteRecord:
                const crudDelete = new CRUDManager(step, this.recordId);
                await crudDelete.deleteRecord();
                this.currentStep.result = "Deleted Successfully";
                break;
            default:
                break;
        }
        // update current step based on node type
        if (step.type === NodeType.wait) {
            // @ts-ignore
            if((step.data.stepData.apiName === 'consent confirmation')) {
                stepResult = `Execution paused for waiting consent approval`;
                this.currentStep.result = stepResult
                this.currentStep.status = WorkflowStatus.paused
                await this.currentStep.save();

                this.checkInterval = 10000; // Check every 10 seconds
                const checkDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                const startTime = Date.now();

                if(this.consentRecordId != ''){
                    const webhookUrl = await Webhook.find({company:this.company_id});
                    if (webhookUrl && webhookUrl.length > 0) {
                        this.intervalId = setInterval(async () => {
                            try {
                                const records = await WebhookEvent.find({ consent_id: this.consentRecordId }).exec();
                                if(records && records.length > 0) {
                                    for (const record of records) {
                                        if (record && record.new_status === 'consent-data-shared') {
                                            this.resume(step.id, this.workflowConfig?.id, this.workflowInstance?.id, this.currentStep?.id)
                                            if (this.intervalId) clearInterval(this.intervalId);
                                            this.consentRecordId = '';
                                            return;                      
                                        }
                                    }
                                } else {
                                    console.error("No record found in the db webhook:");
                                }
                            } catch (error) {
                                console.error("Error checking WebhookEvent record status:", error);
                            }
                            // Check if 24 hours have passed
                            if (Date.now() - startTime >= checkDuration) {
                                console.log("resume calls after 24 hours--------------------------------", startTime,Date.now())
                                this.resume(step.id, this.workflowConfig?.id, this.workflowInstance?.id, this.currentStep?.id);
                                if (this.intervalId) clearInterval(this.intervalId);
                                this.consentRecordId = '';
                                return
                            }
                        }, this.checkInterval); 
                    } else {
                        await notfication(this.company_id, this.user_id, "workflow", `No webhook URL found for the given company ID, please save webhook Url and try again`, '');
                        console.error("No webhook URL found for the given company ID.");
                    }
                }
            }
            // @ts-ignore
            else if((step.data.stepData.apiName === 'timer')) {
                // @ts-ignore
                const timerInMilliseconds = step.data.stepData.timer * 60 * 1000;
                // @ts-ignore
                stepResult = `Execution paused for ${step.data.stepData.timer} minutes`;
                this.currentStep.result = stepResult
                this.currentStep.status = WorkflowStatus.paused
                await this.currentStep.save();                
        
                setTimeout(() => {
                    this.resume(step.id, this.workflowConfig?.id, this.workflowInstance?.id, this.currentStep?.id);
                }, timerInMilliseconds);
            } else {    
                this.currentStep.status = WorkflowStatus.paused
                stepResult = 'Pause execution'
            } 
        } else if (this.parseResult(this.currentStep.result).stack && this.currentStep.type !== 'actionNode') {
            console.log("into partse result error*************************")
            stepResult = WorkflowStatus.error
            if(this.currentStep && this.workflowInstance){
                await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
            } 
        } else if (this.currentStep.type === 'actionNode'){
            this.currentStep.status = WorkflowStatus.completed
            await this.currentStep.save();
            console.log("****Current ***Step**** actionNode\n", this.currentStep, "\n\n")
            return stepResult;
        }
        else {
            this.currentStep.status = WorkflowStatus.completed
        }
        await this.currentStep.save();
        console.log("****Current Step****\n", this.currentStep, "\n\n")
        return stepResult;
    }

    private async executeDecisionStep(step: Node) {
        if (this.workflowConfig?.object) {
            const workflowRuleEngine = new WorkflowRuleEngine(this.workflowConfig?.object)
            if (step.data && step.data.stepData) {
                let result = workflowRuleEngine.validate(step.data.stepData);
                if (result == successMessage) {
                    let JsonRule: JSONRULE = await workflowRuleEngine.getRules(step.data.stepData);
                    await workflowRuleEngine.addFact(this.workflowConfig?.object, "id", this.getRecord);
                    if (JsonRule) {
                        await workflowRuleEngine.addRules([JsonRule]);
                    }
                    console.log("Executing rules for " + this.recordId + " records at decision node");
                    // Get all the transaction

                    const response = await workflowRuleEngine.execute({ id: this.recordId });
                    console.log("Execute Decision Step:", response);
                    if (this.currentStep) {
                        this.currentStep.result = JSON.stringify(response);
                    }
                    if (response && response.length > 0) {
                        if (response[0].result == true) {
                            return response[0].conditions;
                        }
                    }
                    return false
                }
            }
            else {
                throw new BadRequestError('Invalid Data');
            }
        }
        return ''
        // return {error: 'Workflow config object is not present'}
    }

    private getRecord = async (id: string, objectName = this.workflowConfig?.object) => {
        const dataRecord = await DataRecord.findById(id);
        let fields = {};
        if (dataRecord) {
            async function getNestedValues(dataRecord: DataRecordDoc) {
                const baseDataModel = await Datamodel.findById(dataRecord.dataModel);
                if (baseDataModel) {
                    const dataRecordProperties = dataRecord.fields;
                    const dataModelProperties = baseDataModel.properties;
                    for (const key in dataModelProperties) {
                        // @ts-ignore
                        if (dataModelProperties[key].type === 'reference') {
                            // @ts-ignore
                            const nestedDataRecord = await DataRecord.findById(dataRecordProperties[key]);
                            if (nestedDataRecord) {
                                await getNestedValues(nestedDataRecord);
                            }
                        }
                        else {
                            // @ts-ignore
                            fields[key] = dataRecordProperties[key]
                        }
                    }
                }
            }
            if (dataRecord) {
                await getNestedValues(dataRecord);
            }
            return fields;
        }
        return fields;
    };

    private async createConsent(dataRecord: DataRecordDoc, currentIntegration?: IntegrationDoc, redirect_url?: string) {
        const companyId = dataRecord.company;
        const company = await Company.findById(companyId);
        let company_name = '';
        if (company) {
            company_name = company.companyName;
        }
        const fields = dataRecord.fields;
        // @ts-ignore
        const salutation = "MR."
        // @ts-ignore
        const first_name = fields['FirstName']
        // @ts-ignore
        const last_name = fields['LastName']
        // @ts-ignore
        const psu_email = fields['Email']
        // @ts-ignore
        // const birth_date = fields['DateOfBirth'].split('T')[0]
        const birth_date = '2001-01-01';

        // @ts-ignore
        const phone_number = fields['Phone']
        // @ts-ignore
        const address = fields['Address']
        let newConsentBody = {
            "psu_email": psu_email,
            "exp_notification": true,
            "business": true,
            "psu_info": {
                "salutation": salutation,
                "first_name": first_name,
                "last_name": last_name,
                "postcode": 'LU13LU',
                "address_line_1": 'test',
                // "postcode": address['PostCode'],
                // "address_line_1": address['HouseNumber'],
                "address_line_2": 'test',
                "town": 'test',
                "county": 'U.K.',
                // "address_line_2": address['Street'],
                // "town": address['TownOrCity'],
                // "county": address['Country'],
                "birth_date": birth_date,
                "phone_number": phone_number,
                "account_holders_num": 0,
                "company_name": company_name,
                "company_number": "123"
            },
            //@ts-ignore
            "redirect_url": redirect_url ? redirect_url : currentIntegration?.metaFields?.find(mf=>mf.key==='consentRedirectURL')?.value,
            "data_visibility_lifetime_days": 90
        }
        const consentParams: { value: any; key: string }[] = [
            { key: 'recordId', value: dataRecord.id as any },
            { key: 'body', value: newConsentBody as any }
        ];
        return consentParams
    }

    private async createTransactionsParams(consentId: string | null, dataRecordObject: DataRecordDoc, transactionsTrustLoop: Trustloop) {
        let transactionsParams: {key: string, value: any}[];
        let fields;
        let consentObjectId = consentId;
        let today = new Date();
        let year = today.getFullYear().toString().slice(-4); // Get the last two digits of the year
        let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Add 1 to the month (0-indexed) and format with leading zero
        let day = today.getDate().toString().padStart(2, '0');
        let tillDate = `${year}-${month}-${day}`

        let transactionsQuery = {
            sort_by: "by_date",
            desc: true,
            limit: 100,
            offset: 1,
            from: "2022-06-01",
            till: tillDate
        }

        if (consentId) {
            const consent = await DataRecord.findById(consentObjectId);
            if (!consent) {
                throw new BadRequestError("Record ID not found");
            }
            fields = consent.fields;
            // @ts-ignore
            consentId = fields['consent_id']
            transactionsParams = [
                {key: 'recordId', value: this.recordId as any},
                {key: 'consentId', value: consentId},
                {key: 'body', value: transactionsQuery}
            ];
        }
        else {
            const consentParams = await this.createConsent(dataRecordObject)
            const consentTrustLoopResponse = await transactionsTrustLoop.execute('createConsent', consentParams);
            consentObjectId = consentTrustLoopResponse._id;
            fields = consentTrustLoopResponse.fields;
            consentId = fields.consent_id;
            transactionsParams = [
                {key: 'recordId', value: this.recordId as any},
                {key: 'consentId', value: consentId},
                {key: 'body', value: transactionsQuery}
            ];
        }
        return transactionsParams;
    }

    private async createAnalyticsParams(consentId: string, dataRecord: DataRecordDoc, analyticsTrustLoop: Trustloop, accountId: string) {
        let fields;
        let analyticsParams: {key: string, value: any}[];
        let consentObjectId = consentId;
        let analyticsBody = {
            "blocks":[  "overview",
                "income",
                "income_summary",
                "behaviours",
                "expenditure",
                "expenditure_summary",
                "transactions",
                "transactions_summary",
                "affordability",
                "affordability_summary",
                "utilities",
                "collections"
            ]
        }
        if (consentId) {
            const consent = await DataRecord.findById(consentObjectId);
            if (!consent) {
                throw new BadRequestError("Record ID not found");
            }
            fields = consent.fields;
            // @ts-ignore
            consentId = fields['consent_id']
            analyticsParams = [
                {key: 'recordId', value: accountId as any},
                {key: 'consentId', value: consentId},
                {key: 'body', value: analyticsBody as any}
            ];
        }
        else {
            const consentParams = await this.createConsent(dataRecord)
            const consentTrustLoopResponse = await analyticsTrustLoop.execute('createConsent', consentParams);
            consentObjectId = consentTrustLoopResponse._id;
            fields = consentTrustLoopResponse.fields;
            consentId = fields.consent_id;
            analyticsParams = [
                {key: 'recordId', value: accountId as any},
                {key: 'consentId', value: consentId},
                {key: 'body', value: analyticsBody as any}
            ];
        }
        return analyticsParams;
    }

    public async executeActionstep(step: Node) {
        console.log("executeActionStep====================",step)
        let apiName = ''
        let consentId = ''
        let confirmLink = ''
        let fields;
        let apiResponse;
        let consentObjectId;
        let objectName = '';
        let dataRecordObject;
        let stepData: any = step.data.stepData
        if (stepData) {
            apiName = stepData.apiName ? stepData.apiName : ''
        }
        switch (apiName) {
            case 'startStudioFlowForZohoSign':
                if (!this.workflowConfig?.company) {
                    if(this.currentStep && this.workflowInstance) this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    throw new BadRequestError("Invalid Configuration");
                }
                const integrationTwilio = await Integration.findOne({ name: Integrations.twilio, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if (!integrationTwilio) {
                    if(this.currentStep && this.workflowInstance) this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    throw new BadRequestError("Invalid Integration");
                }

                const twilio = new Twilio(this.workflowConfig?.company._id, integrationTwilio);

                const application: DataRecordDoc | null  = await DataRecord.findOne({ _id:this.recordId, objectName: this.workflowConfig.object });
                const iAId: any = (application?.fields as Record<string, unknown>)?.['IndividualAccount'];

                const user: DataRecordDoc | null = await DataRecord.findOne({ _id:iAId, objectName: 'IndividualAccount' });
                const contract: DataRecordDoc | null = await DataRecord.findOne({objectName: 'Contract', 'fields.ApplicationId': this.recordId});

                twilio.execute(apiName, user, contract);
                return;

            case 'getCreditReport':
                if (!this.workflowConfig?.company) {
                    await notfication(this.company_id, this.user_id,"workflow", "Someting went wrong with Credit Report configuration, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id);
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Credit Report', stack: '', Reason: 'Invalid Configuration/Company' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }  
                    throw new BadRequestError("Invalid Configuration");
                }
                // By creating object, it will verify the response
                const integrationTransUnion = await Integration.findOne({ name: Integrations.transUnion, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if (!integrationTransUnion) {
                    await notfication(this.company_id, this.user_id, "integration", "Someting went wrong with Integration", this.workflowInstance?._id);
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Credit Report', stack: '', Reason: 'Invalid Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }     
                    throw new BadRequestError("Invalid Integration");
                }
                const transUnion = new TransUnion(this.workflowConfig?.company._id, integrationTransUnion);
                let apiTransUnionParams = [];
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Credit Report, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Credit Report', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                objectName = dataRecordObject.objectName.toString().toLowerCase();
                if (objectName.includes("account")){
                    apiTransUnionParams.push({ key: 'recordId', value: this.recordId })
                } else {
                    const dataModel = await Datamodel.findById(dataRecordObject.dataModel);
                    let accountID;
                    for(const key in dataModel?.properties) {
                        // @ts-ignore
                        if(dataModel.properties[key].type === 'reference' && dataModel.properties[key].ref === 'IndividualAccount') {
                            // @ts-ignore
                            accountID = dataRecordObject.fields[`${key}`]
                        }
                    }
                    let accountDataRecord = await DataRecord.findById(accountID);
                    if (!accountDataRecord){
                        await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Credit Report, Record ID not found, workflow: "+ this.workflowConfig?.id, this.workflowInstance?._id)
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with get Credit Report', stack: '', Reason: 'Record ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Record ID not found");
                    }
                    apiTransUnionParams.push({ key: 'recordId', value: accountDataRecord.id })
                }
                apiResponse = await transUnion.execute(apiName, apiTransUnionParams);
                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(apiResponse); 
                }
                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////get credit report////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges-------get credit report---------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;

            case 'getAnalytics':
                if(!this.workflowConfig?.company){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with workflow to get Analytics "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Analytics', stack: '', Reason: 'Invalid Company/Invalid Configuration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Configuration");
                }
                const analyticsIntegrationTrustloop = await Integration.findOne({name:Integrations.trustloop, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if(!analyticsIntegrationTrustloop){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Integration", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Analytics', stack: '', Reason: 'Invalid Trustloop Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Integration");
                }

                const analyticsTrustLoop = new Trustloop(this.workflowConfig?.company._id, analyticsIntegrationTrustloop);
                let analyticsParams: {key: string, value: any}[];
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Analytics, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Analytics', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                let accountID;
                objectName = dataRecordObject.objectName.toString().toLowerCase();
                if (objectName.includes("account")){
                    accountID = dataRecordObject.id;
                    fields = dataRecordObject.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                else{
                    let applicationFields = dataRecordObject.fields;
                    // @ts-ignore
                    accountID = applicationFields['IndividualAccount']
                    let accountDataRecord = await DataRecord.findById(accountID);
                    if (!accountDataRecord){
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with get Analytics', stack: '', Reason: 'Account ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Account ID not found");
                    }
                    fields = accountDataRecord.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                analyticsParams = await this.createAnalyticsParams(consentId, dataRecordObject, analyticsTrustLoop, accountID)
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, analyticsParams)
                const analyticsConsent = await DataRecord.findById(consentObjectId);
                if (!analyticsConsent) {
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Analytics', stack: '', Reason: 'Consent Object ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Consent Object ID not found");
                }
                fields = analyticsConsent.fields;
                // @ts-ignore
                confirmLink = fields['confirm_link'];
                // @ts-ignore
                consentId = fields['consent_id'];
                apiResponse = await analyticsTrustLoop.execute(apiName, analyticsParams);
                apiResponse.fields = {...apiResponse.fields, 'confirm_link': confirmLink}
                apiResponse.fields = {...apiResponse.fields, 'consent_id': consentId}
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, analyticsParams, apiResponse)
                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(apiResponse);
                }
                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////get analytics////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges------get analytics----------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;

            case 'createConsent':
                if(!this.workflowConfig?.company){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with workflow  "+this.workflowConfig?.id+ " to create Consent /Invalid Configuration/Company Id", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with create Consent', stack: '', Reason: 'Invalid Configuration/Invalid Company Id' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Configuration/Company");
                }
                const consentIntegrationTrustloop = await Integration.findOne({name:Integrations.trustloop, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if(!consentIntegrationTrustloop){
                    await notfication(this.company_id, this.user_id, "integration", "Something went wrong with Integration", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with create Consent', stack: '', Reason: 'Invalid Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Integration");
                }
                const consentTrustLoop = new Trustloop(this.workflowConfig?.company._id, consentIntegrationTrustloop);
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with create consent, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with create Consent', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                objectName = dataRecordObject.objectName.toString().toLowerCase();
                let consentParams;
                if (objectName.includes("account")){
                    consentParams = await this.createConsent(dataRecordObject)
                }
                else{
                    let applicationFields = dataRecordObject.fields;
                    const dataModel = await Datamodel.findById(dataRecordObject.dataModel);
                    let accountID;
                    for(const key in dataModel?.properties) {
                        // @ts-ignore
                        if(dataModel.properties[key].type === 'reference' && dataModel.properties[key].ref === 'IndividualAccount') {
                            // @ts-ignore
                            accountID = applicationFields[`${key}`]
                        }
                    }
                    let accountDataRecord = await DataRecord.findById(accountID);
                    if (!accountDataRecord){
                        await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with create consent, Account ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with create Consent', stack: '', Reason: 'Account ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Account ID not found");
                    }
                    // @ts-ignore
                    const redirect_url = dataRecordObject.fields['redirect_url'];
                    consentParams = await this.createConsent(accountDataRecord, consentIntegrationTrustloop, redirect_url)
                }
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, consentParams)
                apiResponse = await consentTrustLoop.execute(apiName, consentParams);
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, consentParams, apiResponse)
                console.log("****apiResponse****\n", apiResponse)
                if (this.currentStep) {
                    this.consentRecordId = apiResponse?.fields?.consent_id;
                    this.currentStep.result = JSON.stringify(apiResponse);
                }
                console.log("respnse-==-0=-0=-0=-0=-0=-0=0=-=",apiResponse.stack,this.consentRecordId)

                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////create consent////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges-------create consent---------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;

            case 'getTransactions':
                if(!this.workflowConfig?.company){
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Transactions', stack: '', Reason: 'Invalid Configuration/Company' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Configuration");
                }
                const transactionsIntegrationTrustloop = await Integration.findOne({name:Integrations.trustloop, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if(!transactionsIntegrationTrustloop){
                    await notfication(this.company_id, this.user_id, "integration", "Something went wrong with integration", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Transactions', stack: '', Reason: 'Invalid Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Integration");
                }
                const transactionsTrustLoop = new Trustloop(this.workflowConfig?.company._id, transactionsIntegrationTrustloop);
                let transactionsParams: {key: string, value: any}[];
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with get Transactions, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Transactions', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }

                objectName = dataRecordObject.objectName.toString().toLowerCase();
                if (objectName.includes("account")){
                    fields = dataRecordObject.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                else{
                    let applicationFields = dataRecordObject.fields;
                    // @ts-ignore
                    let accountID = applicationFields['IndividualAccount']
                    let accountDataRecord = await DataRecord.findById(accountID);
                    if (!accountDataRecord){
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with get Transactions', stack: '', Reason: 'Record ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Record ID not found");
                    }
                    fields = accountDataRecord.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                transactionsParams = await this.createTransactionsParams(consentId, dataRecordObject, transactionsTrustLoop)
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, transactionsParams)
                const transactionsConsent = await DataRecord.findById(consentObjectId);
                if (!transactionsConsent) {
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get Transactions', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                fields = transactionsConsent.fields;
                // @ts-ignore
                confirmLink = fields['confirm_link'];
                // @ts-ignore
                consentId = fields['consent_id'];
                apiResponse = await transactionsTrustLoop.execute(apiName, transactionsParams);
                apiResponse.fields = {...apiResponse.fields, 'confirm_link': confirmLink}
                apiResponse.fields = {...apiResponse.fields, 'consent_id': consentId}
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, transactionsParams, apiResponse)
                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(apiResponse);
                }
                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////get transaction////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges------get transaction----------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;

            case 'getandUpdateConsent': 
                if(!this.workflowConfig?.company){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Configuration, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get/update Consent', stack: '', Reason: 'Invalid Configuration/Company' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Configuration");
                }
                const trustLoopIntegration = await Integration.findOne({name:Integrations.trustloop, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if(!trustLoopIntegration){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with integration", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get/update Consent', stack: '', Reason: 'Invalid Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Integration");
                }
                const trustloop = new Trustloop(this.workflowConfig?.company._id, trustLoopIntegration);
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with get/update consent, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with get/update Consent', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                let consentRecordId;
                objectName = dataRecordObject.objectName.toString().toLowerCase();
                if (objectName.includes("account")){
                    //@ts-ignore
                    consentRecordId = dataRecordObject.fields.Consent;
                }
                else{
                    let applicationFields = dataRecordObject.fields;
                    const dataModel = await Datamodel.findById(dataRecordObject.dataModel);
                    let accountID;
                    for(const key in dataModel?.properties) {
                        // @ts-ignore
                        if(dataModel.properties[key].type === 'reference' && dataModel.properties[key].ref === 'IndividualAccount') {
                            // @ts-ignore
                            accountID = applicationFields[`${key}`]
                        }
                    }
                    let accountDataRecord = await DataRecord.findById(accountID);
                    if (!accountDataRecord){
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with get/update Consent', stack: '', Reason: 'Record ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Record ID not found");
                    }
                    //@ts-ignore
                    consentRecordId = accountDataRecord.fields.Consent;
                }
                const consentDataRecord = await DataRecord.findById(consentRecordId);
                //@ts-ignore
                const consent_id = consentDataRecord?.fields.consent_id;
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, consent_id)
                apiResponse = await trustloop.execute(apiName, [], [ consent_id ]);
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, consent_id, apiResponse)
                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(apiResponse);
                }
                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////getandUpdateConsent////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges------getandUpdateConsent----------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;

            case 'refetchData':
                if(!this.workflowConfig?.company){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with configuration, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with refetch data', stack: '', Reason: 'Invalid Configuration/Company' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Configuration");
                }
                const refetchIntegrationTrustloop = await Integration.findOne({name:Integrations.trustloop, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })
                if(!refetchIntegrationTrustloop){
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with integration", this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with refetch data', stack: '', Reason: 'Invalid Integration' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Invalid Integration");
                }

                const refetchTrustLoop = new Trustloop(this.workflowConfig?.company._id, refetchIntegrationTrustloop);
                dataRecordObject = await DataRecord.findOne({_id: this.recordId, isActive: true});
                if (!dataRecordObject) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with refetch data, Record ID not found, workflow: "+this.workflowConfig?.id, this.workflowInstance?._id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with refetch data', stack: '', Reason: 'Record ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Record ID not found");
                }
                let recordId;
                objectName = dataRecordObject.objectName.toString().toLowerCase();
                if (objectName.includes("account")){
                    recordId = dataRecordObject.id;
                    fields = dataRecordObject.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                else{
                    let applicationFields = dataRecordObject.fields;
                    // @ts-ignore
                    recordId = applicationFields['IndividualAccount']
                    let accountDataRecord = await DataRecord.findById(recordId);
                    if (!accountDataRecord){
                        await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with refetch data, Record ID not found, workflow: "+this.workflowConfig?.id)
                        if (this.currentStep && this.workflowInstance) {
                            let errorResult: any = { message: 'Something went wrong with refetch data', stack: '', Reason: 'Record ID not found' };
                            this.currentStep.result = JSON.stringify(errorResult);
                            await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                        }
                        throw new BadRequestError("Record ID not found");
                    }
                    fields = accountDataRecord.fields;
                    // @ts-ignore
                    consentId = fields['Consent'];
                    consentObjectId = consentId;
                }
                console.log("****Logger****\n", dataRecordObject.objectName, objectName)
                const refetchConsent = await DataRecord.findById(consentObjectId);
                //@ts-ignore
                const refetch_consent_id = refetchConsent?.fields.consent_id;

                if (!refetchConsent) {
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with refetch data, Consent Object ID not found, workflow: "+this.workflowConfig?.id)
                    if (this.currentStep && this.workflowInstance) {
                        let errorResult: any = { message: 'Something went wrong with refetch data', stack: '', Reason: 'Consent Object ID not found' };
                        this.currentStep.result = JSON.stringify(errorResult);
                        await this.checkErrorSendResponseBack(this.workflowInstance,this.currentStep)
                    }
                    throw new BadRequestError("Consent Object ID not found");
                }
                apiResponse = await refetchTrustLoop.execute(apiName, [], [refetch_consent_id]);
                console.log("****Logger****\n", dataRecordObject.objectName, objectName, refetch_consent_id, apiResponse)

                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(apiResponse);
                }
                if (apiResponse && !apiResponse.stack) {
                    console.log("respnse-==-0=////refetch////=-0=-0=-0=-0=0=-=",apiResponse.stack, step.id)
                    const matchingEdges = Array.from(this.edges.values()).filter(edge => edge.source === step.id);
                    console.log("matchingEdges------refetch----------",matchingEdges)
                    if(matchingEdges && matchingEdges.length > 0){
                        for (const edge of matchingEdges) {
                            if (edge?.sourceHandle === undefined || edge?.sourceHandle === null) {
                                return undefined;
                            } else {
                                return true
                            }
                        }
                    }
                }
                return false
                // break;
            default:
                return;
        }
    }

    public async checkEligibility(workflow: WorkflowDoc) {
        console.log("checkEligibility----------------------------------")
        if (workflow?.object) {
            const workflowRuleEngine = new WorkflowRuleEngine(workflow?.object)
            console.log("workflowRuleEngine----------------------------------",workflowRuleEngine)
            let result = workflowRuleEngine.validate(workflow, 'workflow');
            console.log("Check workflowRuleEngine.validate:=====", result);

            if (result == successMessage) {
                let JsonRule: JSONRULE = await workflowRuleEngine.getRules(workflow, 'workflow');
                await workflowRuleEngine.addFact(workflow?.object, "id", this.getRecord);
                if (JsonRule) {
                    await workflowRuleEngine.addRules([JsonRule]);
                }
                console.log("Executing filter conditions for " + this.recordId + " records at workflow");
                // Get all the transaction
                const response = await workflowRuleEngine.execute({ id: this.recordId });
                console.log("Check Eligibility response:=====", response);
                if (this.currentStep) {
                    this.currentStep.result = JSON.stringify(response);
                }
                if (response && response.length > 0) {
                    if (response[0].result == true) {
                        return response[0].conditions;
                    }
                }
                return false
            }
        }
        return ''
    }


    private async executeNoteStep(step:any) {
        console.log("step--------------------------",step)
        const data = await DataRecord.findById(this.recordId);
        if (data) {
            const note = Note.build({
              comment: step?.data?.stepData?.comment,
              reference: referenceType.dataRecord,
              referenceId: data.dataModel,
              recordId: this.recordId,
              company: data.company,
              createdBy: data.createdBy,
            });
            await note.save();
            
            if (note) {
                await activity(data.id,this.company_id, this.user_id, data.objectName, `New Note Created "${note.comment}"`,data );
                return note.comment;
            } else {
                let errorResult: any = { message: 'Something went wrong with note', stack: '', Reason: 'Error while save' };
                await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with Note", this.workflowInstance?._id)
                return errorResult;
            }
        } else {
            console.log('DataRecord not found');
            throw new BadRequestError('DataRecord not found');
        }
    }

    public parseResult (value: any) {
        if(!value) return {stack: "This is older api calls where result can't be stored"}
        let parsedValue = value;
        const result = value;
        if (result.startsWith("[")){
            parsedValue = JSON.parse(value.replaceAll('\\', '').replace('["','').replace('"]',''))
        }
        if(result.startsWith("{"))
            parsedValue = JSON.parse(parsedValue);
        return parsedValue;

    }

    private async executeLendXPStep(step: any) {
        let url = "";
        let signature = "";

        if (!this.workflowConfig?.company) {
            let errorResult: any = { message: 'Something went wrong with lendXP', stack: '', Reason: 'Invalid Company' };
            return errorResult;        }
        // By creating object, it will verify the response
        const integrationLendXP = await Integration.findOne({ name: Integrations.lendXP, company: this.workflowConfig?.company, isActive: true, type: IntegrationType.api })

        if (!integrationLendXP) {
            await notfication(this.company_id, this.user_id, "Integration", "Invalid LendXP Integration", this.workflowInstance?._id)
            let errorResult: any = { message: 'Something went wrong with lendXP integration', stack: '', Reason: 'Invalid LendXP Integration' };
            return errorResult;   
        } else {
            if(integrationLendXP?.metaFields){
                integrationLendXP?.metaFields.forEach((ele)=>{
                    if (ele.key === "signature") {
                        signature = ele.value;
                      }
                      if (ele.key === "url") {
                        url = ele.value;
                      }
                })
            }
        }

        if (this.workflowConfig?.object) {
            if (!url || !signature){
                await notfication(this.company_id, this.user_id, "workflow", "Invalid URL or Signature", this.workflowInstance?._id)
                throw new BadRequestError("Invalid URL or Signature");
            }
            let LendXPBaseUrl = url;

            const getRecord :any = await this.getRecord(this.recordId)
            const dataRecord = await DataRecord.findById(this.recordId);
            if (!dataRecord) {
                let errorResult: any = { message: 'Something went wrong with lendXP API response', stack: '', Reason: 'Record ID not found' };
                return errorResult;
            }
            const dataRecordAppId = dataRecord?.recordId
            const applicaitonId = dataRecord?._id
            const payLoadData :{[key:string]:string|null} = {};
            
            if (step.data && step.data.stepData) {
                step.data.stepData.inputValues.map((ele:any) => {
                    const getFieldName:string = this.getFieldName(ele.fieldName);
                    const prop:string = ele.variable.path;
                    switch (getFieldName) {
                        case VariableIds.applicaitonId:
                            payLoadData[getFieldName]=applicaitonId;
                            break;
                        case VariableIds.lInfraId:
                            payLoadData[getFieldName]=(dataRecordAppId)?dataRecordAppId:'';
                            break;
                    
                        default:
                            payLoadData[getFieldName] = getRecord[prop]  ? this.cleanString(getRecord[prop]) : null;
                            break;
                    }
                  });

                  payLoadData["event_identifier"]=this.generateRandomNumberString(32)
                  payLoadData["signature"]=signature

                  JSON.stringify(payLoadData)
                try {
                    const response = await axios.post(LendXPBaseUrl, payLoadData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log('LendXP Response:-------------------------------------------', response.data);
                    if (response && response?.status == 200) {
                        await activity(dataRecord.id,this.company_id, this.user_id, dataRecord.objectName, "Decline decision sent to LendXP",dataRecord );
                        return response.data;
                    } else {
                        let errorResult: any = { message: 'Something went wrong with lendXP API response', stack: '', Reason: 'Response Not getting from API' };
                        return errorResult;
                    }
                    
                } catch (error:any) {
                    let errorResult: any = { message: error.message, stack: error.stack };
                    if (error.response && error.response.data) {
                        errorResult = {
                            ...errorResult,
                            Reason: error.response.data,
                        };
                    }
                    await notfication(this.company_id, this.user_id, "workflow", "Something went wrong with LendXP", this.workflowInstance?._id)
                    console.error('LendXP Error:------------------------------------------------', error);
                    return errorResult;
                }
            } else {
                console.error('LendXP BadRequestError: ');
                throw new BadRequestError('Invalid Data');
            }
        }
    }

     cleanString(input:string) {
        if (typeof input !== 'string') {
            return  input;
        }
        return input.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    }
    
    getFieldName(name:string){
        const fieldArr = name.split(" ");
        let result = name;
        if (fieldArr.length > 1) {
          const modiefiedName = fieldArr[0] + fieldArr[1];
          result = modiefiedName;
        }
        return result;
    };

    generateRandomNumberString(length:any) {
        return Math.random().toString().substr(2, length);
    }

    async checkErrorSendResponseBack(workflowInstance: WorkflowInstanceDoc,currentStep:WorkflowStepDoc ) {
        workflowInstance.status = WorkflowStatus.error;
        await workflowInstance.save();
        currentStep.status = WorkflowStatus.error
        await currentStep.save();
    }   
}
export enum VariableIds{
    applicaitonId="ApplicationId",
    lInfraId="LInfraId"
}
