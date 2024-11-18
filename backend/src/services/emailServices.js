import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const SendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Gunakan 465 untuk SSL
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { otpExpires } = generateOtp(); 
  const expirationTime = otpExpires.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `
      Hi there,

      Thank you for registering with us!

      Your One-Time Password (OTP) for verification is: **${otp}**

      Please enter this OTP before **${expirationTime}** to complete your verification process.

      If you did not request this OTP, please ignore this email.

      Thank you,
      The Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  return { otp, otpExpires };
};
