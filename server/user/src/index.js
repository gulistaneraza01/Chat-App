import express from "express";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.js";
import cors from "cors";
import adminInit from "./queue/admin.js";

const app = express();

const port = process.env.PORT || 3000;
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRouter);

adminInit();
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server Listening On PORT: ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
