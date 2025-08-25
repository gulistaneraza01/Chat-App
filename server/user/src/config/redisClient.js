import { Redis } from "ioredis";
import { redisURI } from "../utils/constraints.js";

const redis = new Redis(redisURI);

redis.on("connect", () => {
  console.log("✅ Connected to Redis server");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
