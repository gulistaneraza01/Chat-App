import jwt from "jsonwebtoken";
import { jwtSecretKey } from "./constraints.js";

async function verifyToken(token) {
  try {
    const decode = jwt.verify(token, jwtSecretKey);
    return decode;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export default verifyToken;
