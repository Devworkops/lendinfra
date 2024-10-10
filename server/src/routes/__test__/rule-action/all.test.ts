import request from "supertest";
import {app} from "../../../app";
import { createRule, createRuleAction, createRuleset } from "../utils";

it("can fetch a list of rule actions for a rule set", async () => {
  const rulesetId = (await createRuleset("RulesetTest")).body.id
  await createRuleAction("RuleActionTest-1", rulesetId);
  await createRuleAction("RuleActionTest-2", rulesetId);
  await createRuleAction("RuleActionTest-3", rulesetId);
  const response = await request(app)
    .get(`/api/rule-action/all/${rulesetId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});
