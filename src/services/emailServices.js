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
    subject: "Kode OTP Verifikasi",
    text: `
       Halo,

      Terima kasih telah mendaftar di platform kami!

      Berikut adalah Kode OTP (One-Time Password) Anda untuk verifikasi: **${otp}**

      Harap masukkan kode OTP ini sebelum pukul **${expirationTime}** untuk menyelesaikan proses verifikasi Anda.

      Jika Anda tidak meminta kode OTP ini, silakan abaikan email ini.

      Terima kasih,
      Obesifit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  return { otp, otpExpires };
};
