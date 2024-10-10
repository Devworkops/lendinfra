import request from "supertest";
import {app} from "../../../app";
import { createRule, createRuleset } from "../utils";

it('returns 204 on successful deletion of rule', async() =>{
  const rulesetId = (await createRuleset("RulesetTest")).body.id
  const rule1  = await createRule("RuleTest-1", rulesetId);
  const rule2  =await createRule("RuleTest-2", rulesetId);

  await request(app)
  .delete(`/api/rule/${rule2.body.id}`)
  .expect(204)

  const response = await request(app)
    .get(`/api/rule/all/${rulesetId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);

})
