import { string } from "mathjs";
import { WorkflowManager } from "../classes/WorkflowManager";
import { logActivity } from "../helper/log";
import { DataRecord } from "../models/data-record";
import { TriggerType, Workflow } from "../models/workflow";
import { notfication } from "../helper/notification";
import { activity } from "../helper/activity";

const runWorkflowUtils = async(recordId:string, company_id:string, user_id:string, triggerType:TriggerType[]) => {
    try {
        // Find workflow
        const dataRecord = await DataRecord.findById(recordId);
        console.log("dataRecord--------------------",dataRecord)

        if (!dataRecord) {
            throw new Error(`DataRecord with id ${recordId} not found`);
        }
        
        const workflowsToRun = await Workflow.find({ object: dataRecord.objectName, company: dataRecord.company, isActive: true, triggerType: { $in: [...triggerType] } }).lean().sort({ createdAt: 1 });
        console.log("workflowsToRun--------------------",workflowsToRun)

        // Run Workflow
        if (!workflowsToRun || workflowsToRun.length === 0) {
            await notfication(company_id, user_id, "workflow", `No active workflows found for DataRecord with id ${recordId}`, '');
            throw new Error(`No active workflows found for DataRecord with id ${recordId}`);
        }
        for (let workflow of workflowsToRun) {
            console.log("workflow--------------------",workflow)
            const workflowManager = new WorkflowManager(dataRecord.id);
            if (await workflowManager.checkEligibility(workflow)) {
                // get workflow
                await activity(dataRecord.id,company_id, user_id, dataRecord.objectName, `Workflow "${workflow.name}" Run`,dataRecord);

                await workflowManager.run(workflow._id,company_id,user_id );
            }
        }
        
    } catch (error) {
        await logActivity(company_id, user_id, "DataRecord", "Error while updating DataRecord.");
      console.log(error)    
    }
}
export {runWorkflowUtils}