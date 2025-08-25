import dotenv from "dotenv";
dotenv.config();

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

export { mailUser, mailPass };
