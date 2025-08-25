import express from "express";
import mailConsumer from "./utils/consumer.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

mailConsumer();
app.listen(port, () => {
  console.log(`🚀 Server Listening On PORT: ${port}`);
});
