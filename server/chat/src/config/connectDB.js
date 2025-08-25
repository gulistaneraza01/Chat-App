import mongoose from "mongoose";
import { mongoDBURI } from "../utils/constraints.js";

async function connectDB() {
  try {
    await mongoose.connect(mongoDBURI, { dbName: "ChatAppmicroService" });
    console.log("✅ Connected To MongoDB");
  } catch (error) {
    console.log(`Error Connnection To MongoDB: ${error}`);
    process.exit(1);
  }
}

export default connectDB;
