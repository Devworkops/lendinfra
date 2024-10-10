import request from "supertest";
import {app} from "../../../app";
import { companyId, createRuleset } from '../utils'
import { RuleActionType } from "../../../models/rule-action";

// it('returns a 404 if the rule action is not found', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   await request(app).get(`/api/rule-action/${id}`).send().expect(404);
// });


it('returns a rule action if found', async() => {
  const ruleset = await createRuleset("RulesetTest")
  const ruleaction =   await request(app)
  .post("/api/rule-action/new")
        .send({
            ruleSet: ruleset.body.id,
            name: 'RuleActionTest-1',
            type: RuleActionType.create,
            company: companyId
        })
        .expect(201);

  const ruleactionResponse = await request(app)
  .get(`/api/rule-action/${ruleaction.body.id}`)
  .send()
  .expect(200)
  
  expect(ruleactionResponse.body.name).toEqual("RuleActionTest-1");

})
