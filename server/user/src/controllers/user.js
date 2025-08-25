import redis from "../config/redisClient.js";
import TryCatch from "../utils/tryCatch.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import mailPublisher from "../queue/publisher/mailPublisher.js";

const login = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redis.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({ message: "Too many requests to email" });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redis.set(otpKey, otp, "EX", 300);
  await redis.set(rateLimitKey, "true", "EX", 60);
  const msg = {
    to: email,
    subject: "your OTP Code",
    body: `your otp is ${otp} and valid for 5 mins`,
  };

  await mailPublisher("send-otp", JSON.stringify(msg));

  res.status(200).json({ message: "otp send to your mail", success: true });
});

const verify = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: "Please Enter Email and OTP Number !" });
    return;
  }

  const otpKey = `otp:${email}`;
  const storOtp = await redis.get(otpKey);

  if (!storOtp) {
    res.status(400).json({ mesage: "Otp has been expired!" });
  }

  if (storOtp !== otp) {
    res.status(400).json({ mesage: "Wrong OTP!" });
    return;
  }

  await redis.del(otpKey);

  let user = await User.findOne({ email });
  if (!user) {
    const name = email.split("@")[0];
    user = await User.create({ name, email });
  }
  const token = await generateToken(user.toObject());

  res.status(200).json({ mesage: "sucessfully Login👍", user, token });
});

const profile = TryCatch(async (req, res) => {
  const user = req.user;

  res.status(200).json({ message: "MyProfile Data", user, success: true });
});

const updateName = TryCatch(async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  if (!user || !user._id) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  const data = await User.findByIdAndUpdate(user?._id, { name }, { new: true });

  const token = await generateToken(data?.toObject());

  res.status(200).json({
    message: "User name updated successfully ✅",
    success: true,
    user: data,
    token,
  });
});

const getUser = TryCatch(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    res.json({ message: "invalid User" });
    return;
  }

  res.status(200).json({ user, success: true });
});

const getAllUsers = TryCatch(async (req, res) => {
  const users = await User.find();
  if (users === null) {
    res.status(400).json({ message: "No User Found" });
    return;
  }

  res.status(200).json({ users, success: true });
});

export { login, verify, profile, updateName, getUser, getAllUsers };
