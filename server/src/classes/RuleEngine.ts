import mongoose from "mongoose";
import {successMessage} from "../constants/CommonMessages";
import {BadRequestError} from "../errors/bad-request-error";
import {Rule as RuleModel} from "../models/rule";
import {RuleAction, RuleActionDoc} from "../models/rule-action";
import {RuleSet, RuleSetDoc} from "../models/rule-set";

const {Engine, Rule} = require("json-rules-engine");

export interface JSONRULE {
  conditions?: any
  event?: any
  name?: string
}

export class RuleEngine {
  private engine: typeof Engine;
  private companyId: string;
  private mapOfRuleAction = new Map<string, RuleActionDoc>();
  private ruleSets: RuleSetDoc[] = [];
  private objectName: string;
  private ruleSetIds?: string;
  public onSuccess: any;
  public onFailure: any;

  constructor(companyId: string, objectName: string, ruleSetIds?: string) {
    if (ruleSetIds != undefined) {
      this.ruleSetIds = ruleSetIds;
    }
    this.engine = new Engine();
    this.objectName = objectName;
    this.engine
        .on("success", async (event: any, almanac: any, _ruleResult: any) => {
          const record = await almanac.factValue(event.type);
          if (event.params.ruleSetId) {
            const action = this.mapOfRuleAction.get(event.params.ruleSetId);
            this.onSuccess(record, action, event);
          }
        })
        .on("failure", async (event: any, almanac: any) => {
          const record = await almanac.factValue(event.type);
          if (event.params.ruleSetId) {
            const action = this.mapOfRuleAction.get(event.params.ruleSetId);
            this.onFailure(record, action, event);
          }
        });
    this.companyId = companyId;
  }

  public async validate() {
    const ruleSetIdList = this.ruleSetIds ? this.ruleSetIds.split(",") : null;
    // first validate and initialize rule setup
    if (ruleSetIdList) {
      const rsiList: mongoose.Types.ObjectId[] = [];
      for (const ruleSetId of ruleSetIdList) {
        rsiList.push(new mongoose.Types.ObjectId(ruleSetId));
      }
      this.ruleSets = await RuleSet.find({"_id": {$in: rsiList}, "company": new mongoose.Types.ObjectId(this.companyId), "objectName": {"$regex": this.objectName, "$options": "i"}, "isActive": true});
    } else {
      this.ruleSets = await RuleSet.find({company: new mongoose.Types.ObjectId(this.companyId), objectName: {"$regex": this.objectName, "$options": "i"}, isActive: true});
    }

    if (this.ruleSets.length <= 0) {
      throw new BadRequestError("Please configure the rule set");
    }

    for (const ruleSet of this.ruleSets) {
      // validate rule and action
      const rules = await RuleModel.find({"isActive": true, "ruleSet": ruleSet.id});
      if (rules.length <= 0) {
        throw new BadRequestError(`Please configure the rule for rule set ${ruleSet.name}`);
      }
      for (const rule of rules) {
        if (!rule.criteria) {
          throw new BadRequestError(`Rule Criteria is not defined for ${ruleSet.name} - ${rule.name}`);
        }
        if (rule.criteria && rule.criteria?.length <= 0) {
          throw new BadRequestError(`Rule Criteria is not defined for ${ruleSet.name} - ${rule.name}`);
        }

        // for each criteria - operator, value field name should be defined
        for (const criteria of rule.criteria) {
          if (!criteria.operator) {
            throw new BadRequestError(`Invalid operator for rule criteria ${criteria.id} of ${ruleSet.name} - ${rule.name}`);
          }

          if (criteria.value == undefined) {
            throw new BadRequestError(`Invalid value for rule criteria ${criteria.id} of ${ruleSet.name} - ${rule.name}`);
          }

          if (!criteria.path) {
            throw new BadRequestError(`Invalid field name for rule criteria ${criteria.id} of ${ruleSet.name} - ${rule.name}`);
          }
        }
      }

      const ruleActions = await RuleAction.find({"isActive": true, "ruleSet": ruleSet.id});
      if (ruleActions.length <= 0) {
        throw new BadRequestError(`Please configure the rule action for rule set ${ruleSet.name}`);
      }
      for (const ruleAction of ruleActions) {
        if (!ruleAction.inputParameter) {
          throw new BadRequestError(`Action Input Parameter is not defined for ${ruleSet.name} - ${ruleAction.name}`);
        }
        if (!ruleAction.inputParameter.length) {
          throw new BadRequestError(`Action Input Parameter is not defined for ${ruleSet.name} - ${ruleAction.name}`);
        }

        // for each action - value , field name should be defined
        for (const actionParam of ruleAction.inputParameter) {
          if (actionParam.value == undefined) {
            throw new BadRequestError(`Invalid value for rule action ${actionParam.id} of ${ruleSet.name} - ${ruleAction.name}`);
          }

          if (!actionParam.fieldName) {
            throw new BadRequestError(`Invalid field name for rule action ${actionParam.id} of ${ruleSet.name} - ${ruleAction.name}`);
          }
        }
      }
    }
  }

  public async getRules() {
    const mapOfJsonRule = new Map<string, JSONRULE>();
    const ruleSetIds = [];
    for (const ruleSet of this.ruleSets) {
      ruleSetIds.push(ruleSet.id);

      const jsonRule: JSONRULE = {};
      if (ruleSet.condition == "ALL") {
        jsonRule.conditions = {all: []};
      } else {
        jsonRule.conditions = {any: []};
      }

      jsonRule.event = {
        type: this.objectName,
        params: {
          message: successMessage,
          ruleSetId: ruleSet.id.toString(),
        },
      };

      jsonRule.name = ruleSet.name;

      mapOfJsonRule.set(ruleSet.id, jsonRule);
    }

    // Get rules associated
    const rules = await RuleModel.find({isActive: true, ruleSet: {$in: ruleSetIds}}).populate("ruleSet");

    for (const rule of rules) {
      // get json rule
      const jsonRule = mapOfJsonRule.get(rule.ruleSet.id);
      if (jsonRule) {
        if (jsonRule.conditions.all) {
          if (rule.condition == "ALL") {
            jsonRule.conditions.all.push({all: []});
          } else {
            jsonRule.conditions.all.push({any: []});
          }
        } else {
          if (rule.condition == "ALL") {
            jsonRule.conditions.any.push({all: []});
          } else {
            jsonRule.conditions.any.push({any: []});
          }
        }
        // initialize criteria
        if (rule.criteria) {
          for (const criteria of rule.criteria) {
            const cr = {
              fact: criteria.fact,
              operator: criteria.operator,
              value: criteria.value,
              path: `$.${criteria.path}`,
            };

            if (jsonRule?.conditions.all && jsonRule?.conditions.all[0].any) {
              jsonRule?.conditions.all[0].any.push(cr);
            } else if (jsonRule?.conditions.all && jsonRule?.conditions.all[0].all) {
              jsonRule?.conditions.all[0].all.push(cr);
            } else if (jsonRule?.conditions.any && jsonRule?.conditions.any[0].all) {
              jsonRule?.conditions.any[0].all.push(cr);
            } else if (jsonRule?.conditions.any && jsonRule?.conditions.any[0].any) {
              jsonRule?.conditions.any[0].any.push(cr);
            }
          }
        }
      }
    }

    // Initialize rule actions
    this.mapOfRuleAction = await this.getRuleActions(ruleSetIds);

    return mapOfJsonRule;
  }

  public async addRules(rules: typeof Rule[]) {
    if (rules.length > 0) {
      rules.forEach((theRule) => {
        theRule.event.params.rule = theRule.name;
        this.engine.addRule(new Rule(theRule));
      });
    }
  }

  public async addFact(factName: string, pathName: string, callback: (arg0: any) => any, priority?: number) {
    return this.engine.addFact(factName, async (params: any, almanac: { factValue: (arg0: string) => any }) => {
      const result = await almanac.factValue(pathName);
      return await callback(result);
    }, priority);
  }

  private async getRuleActions(ruleSetIds:any[]) {
    const mapOfRuleAction = new Map<string, any>();
    // first get rule setup
    const ruleActions = await RuleAction.find({isActive: true, ruleSet: {$in: ruleSetIds}}).populate("ruleSet");
    for (const action of ruleActions) {
      mapOfRuleAction.set(action.ruleSet.id, action);
    }

    return mapOfRuleAction;
  }

  public async execute(input: any) {
    await this.engine.run(input);
  }
}
