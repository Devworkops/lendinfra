import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {app} from "../app";


export interface global {}
declare global {
    var signin: ()=>Promise<string[]>;
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  process.env.ENVIRONMENT = "TEST";

  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// global.signin = async () => {
//     const firstName = "test";
//     const lastName = "last";
//     const email = "test@test.com";
//     const password = "password";
//     const companyName = 'Test Trustloop'
//
//     // if user exist
//     const existingUser = await User.findOne({ email });
//     let response;
//     if(!existingUser){
//         response = await request(app)
//             .post("/api/users/signup")
//             .send({
//                 firstName,
//                 lastName,
//                 email,
//                 password,
//                 companyName,
//                 address: "test@test.com",
//                 accountingMethod:AccountingMethod.fifo.toString(),
//                 isDAO:false,
//                 baseCurrency:'USD',
//                 exchangeRateInterval:ExchangeRateInterval.day
//             }).expect(201);
//     }
//     else{
//         response = await request(app)
//             .post("/api/users/signin")
//             .send({
//                 email,
//                 password,
//             })
//             .expect(200);
//     }
//
//     const cookie = response.get("Set-Cookie");
//     return cookie;
// };
