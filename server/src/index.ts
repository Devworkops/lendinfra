import mongoose from "mongoose";

import {app} from "./app";

const start = async () => {

  process.on('uncaughtException', function(err) {
    // Handle all uncaught error safely
    console.log(err)
  })

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.DECISION_ENGINE_DB_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.DECISION_ENGINE_DB_URI);
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  const port = process.env.PORT||4000;
  app.listen(port, () => {
    console.log(`Listening on port ${port} !!!!!!!!`);
  });
};

start();
