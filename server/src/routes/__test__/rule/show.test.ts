import request from "supertest";
import {app} from "../../../app";
import { Priority } from "../../../models/rule";
import { createRuleset } from '../utils'

// it('returns a 404 if the rule is not found', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   await request(app).get(`/api/rule/${id}`).send().expect(404);
// });


it('returns a rule if found', async() => {
  const ruleset = await createRuleset("RulesetTest")
  const rule =   await request(app)
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
  .get(`/api/rule/${rule.body.id}`)
  .send()
  .expect(200)
  
  expect(ruleResponse.body.name).toEqual("Rule1");

})
