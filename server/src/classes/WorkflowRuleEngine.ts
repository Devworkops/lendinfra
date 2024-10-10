import { successMessage } from "../constants/CommonMessages";
import { BadRequestError } from "../errors/bad-request-error";

const { Engine, Rule , RuleResult} = require("json-rules-engine");

export interface JSONRULE {
    conditions?: any
    event?: any
    name?: string
}

export class WorkflowRuleEngine {
    private engine: typeof Engine;
    private objectName: string;
    public onSuccess: any;
    public onFailure: any;

    constructor(objectName: string) {
        this.engine = new Engine();
        this.engine.addOperator('startsWithValue', (factValue: string, jsonValue: string) => factValue.toLowerCase().startsWith(jsonValue.toLowerCase()));
        this.objectName = objectName;
        this.engine
            .on("success", async (event: any, almanac: any, _ruleResult: any) => {
                const record = await almanac.factValue(event.type);
                console.log('success record workflow engine rule---------------------', record)
                if (event.params.ruleSetId) {
                    this.onSuccess(record, event);
                }
            })
            .on("failure", async (event: any, almanac: any) => {
                const record = await almanac.factValue(event.type);
                console.log('failed record workflow engine rule--------------------------',record)
                if (event.params.ruleSetId) {
                    this.onFailure(record, event);
                }
            });
    }

    public validate(data: any, type ='step') {
        console.log("validate( data)--------------------",data)
        var condition, inputValues
        switch(type){
            case 'workflow':
                condition = data.filterType
                inputValues = data.filterConditions
                console.log("validate inputValues(workflow)--------------------",inputValues)
                break
                default:
                    condition = data.condition
                    inputValues = data.inputValues
                    console.log("validate inputValues(default)--------------------",inputValues)
                break
        }
        if(condition!='NONE'){
        if (!condition) {
            throw new BadRequestError(`Invalid Configuration : Condition is missing`);
        }
        if (!inputValues || inputValues.length <= 0) {
            throw new BadRequestError(`Invalid Configuration : Input values are missing`);
        }
        // for each criteria - operator, value field name should be defined
        for (const criteria of inputValues) {
            if (!criteria.variable) {
                throw new BadRequestError(`Invalid field name for input criteria`);
            }
            if (!criteria.operator) {
                throw new BadRequestError(`Invalid operator for input criteria ${criteria.variable.label}`);
            }

            if (criteria.value == undefined) {
                throw new BadRequestError(`Invalid value for input criteria ${criteria.variable.label}`);
            }
        }}
        return successMessage
    }

    public async getRules(data: any, type ='step') {
        console.log("validate( data)--------------------",data)
        var condition, inputValues
        switch(type){
            case 'workflow':
                condition = data.filterType
                inputValues = data.filterConditions
                console.log("getRules inputValues(workflow)--------------------",inputValues)
                break
            default:
                condition = data.condition
                inputValues = data.inputValues
                console.log("getRules inputValues(default)--------------------",inputValues)
                break
        }
        const jsonRule: JSONRULE = {};
        if (condition == "and") {
            jsonRule.conditions = { all: [] };
        } else {
            console.log("getRules else--------------------",inputValues)
            jsonRule.conditions = { any: [] };
        }

        jsonRule.event = {
            type: this.objectName,
            params: {
                message: successMessage,
                workflowId:data.workflowId
            },
        };

        jsonRule.name = data.name;

        for (const rule of inputValues) {
                const cr = {
                  fact: rule.variable.key,
                  operator: rule.operator,
                  value: rule.value,
                  path: `$.${rule.variable.path}`,
                };

                if (jsonRule?.conditions.all) {
                  jsonRule?.conditions.all.push(cr);
                }  else if (jsonRule?.conditions.any) {
                  jsonRule?.conditions.any.push(cr);
                }
        }
        return jsonRule;
    }

    public async addRules(rules: typeof Rule[]) {
        if (rules.length > 0) {
            rules.forEach((theRule) => {
                theRule.event.params.rule = theRule.name;
                this.engine.addRule(new Rule(theRule));
            });
        }
    }

    public async addFact(factName: string, pathName: string, callback: (arg0: any, arg1: any) => any, priority?: number) {
        return this.engine.addFact(factName, async (params: any, almanac: { factValue: (arg0: string) => any }) => {
            const result = await almanac.factValue(pathName);
            return await callback(result, factName);
        }, priority);
    }

    public async execute(input: any) {
        console.log("into execute, input--------------------",input)
        let response = await this.engine.run(input);
        console.log("execute--------------------",response)
        const result:typeof RuleResult = response.results;
        console.log("execute result--------------------",result)
        if(result&&result.length==0){
            const failedResult:typeof RuleResult = response.failureResults;
            return failedResult
        }
        else
            return result;
    }

}
