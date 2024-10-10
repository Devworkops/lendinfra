import request from "supertest";
import {app} from "../../../app";
import mongoose from "mongoose";
import { Priority } from "../../../models/rule";
import { createRule, createRuleset } from "../utils";

it("can fetch a list of rule for a company", async () => {
  const rulesetId = (await createRuleset("RulesetTest")).body.id
  await createRule("RuleTest-1", rulesetId);
  await createRule("RuleTest-2", rulesetId);
  await createRule("RuleTest-3", rulesetId);
  const response = await request(app)
    .get(`/api/rule/all/${rulesetId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});
