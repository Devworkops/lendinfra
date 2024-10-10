import request from "supertest";
import {app} from "../../../app";
import { createRuleset, companyId } from '../utils'

it("can fetch a list of rule sets for a company", async () => {
  await createRuleset("RuleSetTest-1");
  await createRuleset("RuleSetTest-2");
  await createRuleset("RuleSetTest-3");
  const response = await request(app)
    .get(`/api/rule-set/all/${companyId}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});

