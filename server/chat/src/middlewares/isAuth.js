import jwt from "jsonwebtoken";
import { jwtSecretKey } from "../utils/constraints.js";

const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please login. No auth header received!",
        success: false,
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const userData = jwt.verify(token, jwtSecretKey);

    if (!userData) {
      res.status(401).json({ message: "Invalid Token", success: false });
      return;
    }

    req.user = userData;
    next();
  } catch (error) {
    res.status(401).json({ MessageEvent: "Invalid Token" });
  }
};

export default isAuth;
