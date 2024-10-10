import request from "supertest";
import { app } from "../../../app";
import mongoose from "mongoose";

const companyId = new mongoose.Types.ObjectId().toHexString();

// it('returns a 400 if the rule-set provided a invalid name', async () => {
//   const ruleset = await request(app)
//     .post("/api/rule-set/new")
//     .send({
//       name: "RuleSetTest-1",
//       company: "CompanyTest-1",
//       condition: "or",
//       isActive: "true",
//       objectName: 'Application'
//     })
//     .expect(201)

//   await request(app)
//     .put(`/api/rule-set/${ruleset.body.id}`)
//     .send({
//       name: "",
//       company: "CompanyTest-1",
//       condition: "or",
//       isActive: true,
//       objectName: 'Application'
//     })
//     .expect(400)
// })

it('updates a rule-set provided valid inputs', async () => {
  const ruleset = await request(app)
    .post("/api/rule-set/new")
    .send({
      name: "RuleSetTest-1",
      company: companyId,
      condition: "or",
      isActive: true,
      objectName: 'Application'
    })
    .expect(201);

  const rulesetResponse = await request(app)
    .put(`/api/rule-set/${ruleset.body.id}`)
    .send({
      name: "RuleSetTest-1updated",
      condition: "and",
      isActive: false,
      objectName: 'Applicationupdated'
    })
    .expect(200)

  expect(rulesetResponse.body.name).toEqual("RuleSetTest-1updated");
  expect(rulesetResponse.body.condition).toEqual("and");
  expect(rulesetResponse.body.isActive).toEqual(false);
  expect(rulesetResponse.body.objectName).toEqual("Application");
})

