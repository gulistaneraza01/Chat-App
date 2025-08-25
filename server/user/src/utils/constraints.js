import dotenv from "dotenv";
dotenv.config();

const mongoDBURI = process.env.MONGO_URI;
const redisURI = process.env.REDIS_URI;
const jwtSecretKey = process.env.JWT_SECRET_KEY;

export { mongoDBURI, redisURI, jwtSecretKey };
