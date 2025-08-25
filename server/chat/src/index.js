import express from "express";
import cors from "cors";
import chat from "./routes/chat.js";
import connectDB from "./config/connectDB.js";
import { app, server } from "./config/socket.js";

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", chat);

const port = process.env.PORT || 3002;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server Listening On PORT: ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
