import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

export const SendPaymentEmail = async (email, codePembayaran, jumlahPembayaran, name) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Kode Pembayaran Anda",
    text: `
      Hi ${name},

      Berikut adalah detail pembayaran Anda:

      - Kode Pembayaran: ${codePembayaran}
      - Jumlah Pembayaran: Rp${jumlahPembayaran.toLocaleString()}

      Silakan lakukan transfer ke rekening berikut:
      - BCA: 809.009.2988 a.n ObesiFit

      Setelah transfer, harap unggah bukti pembayaran Anda melalui aplikasi kami.

      Terima kasih,
      The ObesiFit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Fungsi Generate Payment Code
export const generatePaymentCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); 
};