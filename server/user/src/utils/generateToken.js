import jwt from "jsonwebtoken";
import { jwtSecretKey } from "./constraints.js";

async function generateToken(user) {
  return jwt.sign(user, jwtSecretKey, { expiresIn: "7d" });
}

export default generateToken;
