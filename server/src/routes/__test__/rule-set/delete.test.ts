import request from "supertest";
import {app} from "../../../app";
import { companyId, createRuleset } from "../utils";

it('deletes a rule-set provided valid inputs', async () => {
  const ruleset1 = await createRuleset("RuleSetTest-1");
  const ruleset2 = await createRuleset("RuleSetTest-2");

  await request(app)
    .delete(`/api/rule-set/${ruleset2.body.id}`)
    .send()
    .expect(204)

  const response = await request(app)
    .get(`/api/rule-set/all/${companyId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
})
