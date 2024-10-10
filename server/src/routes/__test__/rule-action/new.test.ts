import request from "supertest"
import { app } from "../../../app"
import {RuleActionType} from "../../../models/rule-action"
import { companyId, createRuleset } from "../utils"

it("returns a 201 on successful creation of rule action", async () => {
    const ruleset = await createRuleset("RulesetTest")
    return request(app)
        .post("/api/rule-action/new")
        .send({
            ruleSet: ruleset.body.id,
            name: 'RuleActionTest-1',
            type: RuleActionType.create,
            company: companyId
        })
        .expect(201);
});
