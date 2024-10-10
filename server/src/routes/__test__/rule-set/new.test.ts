import request from "supertest"
import { app } from "../../../app"
import { companyId } from "../utils";

it("returns a 201 on successful create", async () => {
    return request(app)
        .post("/api/rule-set/new")
        .send({
            name: "RuleSetTest-1",
            company: companyId,
            condition: "or",
            isActive: true,
            objectName:'Application'
        })
        .expect(201);
});

// it('returns an error if an invalid name is provided', async () => {
//     return request(app)
//       .post('/api/rule-set/new')
//       .send({
//         name: '',
//         company: "CompanyTest-1",
//         condition: "or",
//         isActive: true,
//         objectName: "Application"
//       })
//       .expect(400);
//   });

// it("returns a 400 on duplicate create", async () => {
//     const Ruleset = {
//         name: "RuleSetTest-1",
//         company: "CompanyTest-1",
//         condition: "or",
//         isActive: true,
//         objectName: "Application"
//     };
//     const originalRuleSet = await request(app)
//             .post("/api/rule-set/new")
//             .send(Ruleset)

//     expect(originalRuleSet.status).toBe(201);
    
//     return request(app)
//         .post("/api/rule-set/new")
//         .send(Ruleset)
//         .expect(400);
// });
