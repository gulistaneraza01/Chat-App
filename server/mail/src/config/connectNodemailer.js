import nodemailer from "nodemailer";
import { mailPass, mailUser } from "../utils/constraints.js";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  // host: "smtp.gmail.com",
  // port: 465,
  // secure: true,
  // auth: {
  //   user: mailUser,
  //   pass: mailPass,
  // },
});

export default transporter;
