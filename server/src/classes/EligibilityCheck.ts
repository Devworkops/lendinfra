import mongoose from "mongoose";
import debug from "../helper/debug";
import {IRuleAction} from "./IRuleAction";
import {JSONRULE, RuleEngine} from "./RuleEngine";

export class EligibilityCheck implements IRuleAction {
  // this class will have methods related to auto classification
  ruleEngine: RuleEngine;
  mapOfJsonRule: Map<string, JSONRULE> | undefined;
  companyId: string;
  objectName: string;
  recordIds: string[];
  existingClassificationMap: Map<string, any>;
  constructor(companyId: string, ruleSetIds:string|undefined) {
    this.companyId = companyId;
    this.objectName = "Application";
    if (ruleSetIds!="undefined") {
      this.ruleEngine = new RuleEngine(this.companyId, this.objectName, ruleSetIds);
    } else {
      this.ruleEngine = new RuleEngine(this.companyId, this.objectName);
    }

    this.ruleEngine.onSuccess = this.onSuccess;
    this.ruleEngine.onFailure = this.onFailure;
    this.recordIds = [];
    this.existingClassificationMap = new Map<string, any>();
  }

  setup = async (recordIds?: string[]) => {
    // Validate before running setup
    await this.ruleEngine.validate();
    if (recordIds && recordIds?.length > 0) {
      this.recordIds = recordIds;
    } else {
      // implement action
    }
  };

  getApplications = async (id: string) => {
    // return data set
    return null;
  };

  onSuccess = async (record: any, action: any, event: any) => {
    // Implement on success action
  };

  onFailure = async (record: any, action: any, event: any) => {
    debug("Transaction update failed for " + record._id);
  };


  async execute() {
    this.mapOfJsonRule = await this.ruleEngine.getRules();
    await this.ruleEngine.addFact(this.objectName, "id", this.getApplications);
    // @ts-ignore
    for (const jsonRuleKey of this.mapOfJsonRule.keys()) {
      const rule = this.mapOfJsonRule.get(jsonRuleKey);
      if (rule) {
        await this.ruleEngine.addRules([rule]);
      }
      debug("Executing rules for " + this.recordIds.length + " records");
      // Get all the transaction
      for (const recordId of this.recordIds) {
        await this.ruleEngine.execute({id: recordId});
      }
    }
  }
}
