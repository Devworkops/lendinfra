import request from "supertest";
import { app } from "../../app";
import { Priority } from "../../models/rule";
import mongoose from "mongoose";
import { RuleActionType } from "../../models/rule-action";

export const companyId = new mongoose.Types.ObjectId().toHexString();
export const createRuleset = async(name: string) => { 
  return request(app)
    .post("/api/rule-set/new")
    .send({
      name,
      company: companyId,
      condition: "or",
      isActive: true,
      objectName: 'Application'
    })
    .expect(201);
}

export const createRule = async(name: string, rulesetId: string) => { 
  return request(app)
  .post("/api/rule/new")
  .send({
    name: "Rule1",
    ruleSet: rulesetId,
    priority: Priority.low,
    criteria: [{}],
    event: "TestEvent",
    condition: "and",
    isActive: true
})
.expect(201);
}

export const createRuleAction = async(name: string, rulesetId: string) => { 
  return request(app)
  .post("/api/rule-action/new")
  .send({
      ruleSet: rulesetId,
      name,
      type: RuleActionType.create,
      company: companyId
  })
  .expect(201);
}