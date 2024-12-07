import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const resetPasswordOtp = async (email, otp, name) => {
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
    subject: "Kode OTP Reset Password",
    text: `
       Halo ${name},

      Kami menerima permintaan untuk mereset kata sandi Anda.

      Berikut adalah Kode OTP (One-Time Password) Anda untuk mereset kata sandi: **${otp}**

      Harap masukkan kode OTP ini sebelum pukul **${expirationTime}** untuk menyelesaikan proses reset kata sandi Anda.

      Jika Anda tidak meminta reset kata sandi, silakan abaikan email ini.

      Terima kasih,
      Obesifit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const generateOtp = () => {
  // Menghasilkan OTP acak 6 digit
  const otp = crypto.randomInt(100000, 999999);
  // Waktu kadaluwarsa OTP adalah 5 menit dari sekarang
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  return { otp, otpExpires };
};
