import request from 'supertest';
import {app} from "../../../app";
import mongoose from "mongoose";

const companyId = new mongoose.Types.ObjectId().toHexString();

// it('returns a 404 if the rule-set is not found', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   await request(app).get(`/api/rule-set/${id}`).send().expect(404);
// });


it('returns a rule-set if found', async() => {
  const ruleset =   await request(app)
  .post("/api/rule-set/new")
  .send({
      name: "RuleSetTest-1",
      company: companyId,
      condition: "or",
      isActive: true,
      objectName:'Application'
  })
  .expect(201);

  const rulesetResponse = await request(app)
  .get(`/api/rule-set/${ruleset.body.id}`)
  .send()
  .expect(200)
  
  expect(rulesetResponse.body.name).toEqual("RuleSetTest-1");

})
