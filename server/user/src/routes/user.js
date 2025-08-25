import express from "express";
import {
  login,
  verify,
  profile,
  updateName,
  getAllUsers,
  getUser,
} from "../controllers/user.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/me", isAuth, profile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getUser);
router.post("/login", login);
router.post("/verifylogin", verify);
router.post("/updateName", isAuth, updateName);

export default router;
