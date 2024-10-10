import request from "supertest";
import { app } from "../../../app";
import { Priority } from "../../../models/rule";
import { createRuleset } from '../utils'

// it('returns a 400 if the rule provided a invalid name', async () => {
//   const ruleset = await createRuleset("RulesetTest")
//   const rule = await request(app)
//   .post("/api/rule/new")
//   .send({
//   name: "Rule1",
//   ruleSet: ruleset.body.id,
//   priority: Priority.low,
//   criteria: [{}],
//   event: "TestEvent",
//   condition: "and",
//   isActive: true
// })
//     .expect(201)

//   await request(app)
//     .put(`/api/rule/${rule.body.id}`)
//     .send({
//         name: "",
//         priority: Priority.high,
//         criteria: [{}],
//         event: "TestEventUpdated",
//         condition: "or",
//         isActive: true
//     })
//     .expect(400)
// })

it('updates a rule provided valid inputs', async () => {
  const ruleset = await createRuleset("RulesetTest")
  const rule = await request(app)
  .post("/api/rule/new")
  .send({
    name: "Rule1",
    ruleSet: ruleset.body.id,
    priority: Priority.low,
    criteria: [{}],
    event: "TestEvent",
    condition: "and",
    isActive: true
})
    .expect(201);

  const ruleResponse = await request(app)
    .put(`/api/rule/${rule.body.id}`)
    .send({
      name: "Rule1updated",
      priority: Priority.high,
      criteria: [{}],
      event: "TestEventUpdated",
      condition: "or",
      isActive: true
  })
    .expect(200)

  expect(ruleResponse.body.name).toEqual("Rule1updated");
  expect(ruleResponse.body.condition).toEqual("or");
  expect(ruleResponse.body.isActive).toEqual(true);
  expect(ruleResponse.body.priority).toEqual(100);
  expect(ruleResponse.body.event).toEqual("TestEventUpdated");
  expect(ruleResponse.body.criteria).toEqual([{}]);
})
