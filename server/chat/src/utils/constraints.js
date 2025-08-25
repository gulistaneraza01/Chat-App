import dotenv from "dotenv";
dotenv.config();

const mongoDBURI = process.env.MONGO_URI;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const userService = process.env.USER_SERVICE;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY;

export {
  mongoDBURI,
  jwtSecretKey,
  userService,
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinarySecretKey,
};
