import request from "supertest";
import {app} from "../../../app";
import { createRuleAction, createRuleset } from "../utils";

it('returns 204 on successful deletion of rule action', async() =>{
  const rulesetId = (await createRuleset("RulesetTest")).body.id
  const ruleaction1  = await createRuleAction("RuleActionTest-1", rulesetId);
  const ruleaction2  =await createRuleAction("RuleActionTest-2", rulesetId);

  await request(app)
  .delete(`/api/rule-action/${ruleaction2.body.id}`)
  .expect(204)

  const response = await request(app)
    .get(`/api/rule-action/all/${rulesetId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);

})
