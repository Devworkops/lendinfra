import request from "supertest"
import { app } from "../../../app"
import { Priority } from "../../../models/rule";
import { createRuleset } from '../utils'

it("returns a 201 on successful create", async () => {
    const ruleset = await createRuleset("RulesetTest")
    return request(app)
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
});
