import request from "supertest";
import { app } from "../../../app";
import { createRuleAction, createRuleset } from '../utils'
import { RuleActionType } from "../../../models/rule-action";

// it('returns a 400 if the rule action provided a invalid name', async () => {
//   const ruleset = await createRuleset("RulesetTest")
//   const ruleaction = await request(app)
//   .post("/api/rule-action/new")
//         .send({
//             ruleSet: ruleset.body.id,
//             name: 'RuleActionTest',
//             type: RuleActionType.create,
//             company: companyId
//         })
//         .expect(201);

//   await request(app)
//     .put(`/api/rule-action/${ruleaction.body.id}`)
//     .send({
//         ruleSet: ruleset.body.id,
//         name: '',
//         type: RuleActionType.create,
//         company: companyId
//     })
//     .expect(400);
// })

it('updates a rule action provided valid inputs', async () => {
  const ruleset = await createRuleset("RulesetTest")
  const ruleaction = await createRuleAction('RuleActionTest', ruleset.body.id)
  const inputParams = [
    {
        dataType: "String",
        name: "Param1",
        fieldName: "cred_Score",
        value: 100
    },
     {
        dataType: "String",
        name: "Param2",
        fieldName: "validity",
        value: 300
    }
    ];
  const ruleactionResponse = await request(app)
    .put(`/api/rule-action/${ruleaction.body.id}`)
    .send({
      name: "RuleActionUpdated",
      isActive: true,
      inputParameter: inputParams
  })
    .expect(200)

  expect(ruleactionResponse.body.name).toEqual("RuleActionUpdated");
  expect(ruleactionResponse.body.type).toEqual(RuleActionType.create);
  expect(ruleactionResponse.body.isActive).toEqual(true);
  expect(ruleactionResponse.body.inputParameter).toEqual(inputParams);
})
