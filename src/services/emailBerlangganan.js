import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Fungsi untuk mengirim email konfirmasi pembayaran diterima
export const sendApprovalEmail = async (email, name) => {
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
    subject: "Pembayaran Anda Telah Diterima",
    text: `
      Hi ${name},

      Selamat! Pembayaran Anda telah berhasil diverifikasi oleh admin kami. 
      Membership Anda sekarang aktif, dan Anda dapat menikmati semua fitur premium kami.

      Terima kasih telah berlangganan dengan kami!

      Salam hangat,
      ObesiFit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Fungsi untuk mengirim email konfirmasi pembayaran ditolak
export const sendTolakEmail = async (email, name) => {
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
    subject: "Pembayaran Anda Ditolak",
    text: `
      Hi ${name},

      Kami mohon maaf, tetapi bukti pembayaran Anda tidak valid atau tidak dapat diverifikasi. 
      Silakan periksa kembali pembayaran Anda dan kirimkan bukti pembayaran yang benar.

      Jika Anda memerlukan bantuan lebih lanjut, jangan ragu untuk menghubungi tim kami.

      Terima kasih atas pengertiannya.

      Salam hangat,
      ObesiFit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};
