import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Fungsi untuk mengirim email verifikasi
export const sendVerificationEmail = async (email, name) => {
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
    subject: "Akun Anda Telah Diverifikasi",
    text: `
      Hi ${name},

      Selamat! Akun Anda telah berhasil diverifikasi oleh admin kami. 
      Sekarang Anda dapat mengakses fitur-fitur penuh sebagai seorang dokter di platform kami.

      Terima kasih telah bergabung dengan kami!

      Salam hangat,
      ObesiFit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRejectionEmail = async (email, name) => {
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
    subject: "Pendaftaran Anda Ditolak",
    text: `
      Hi ${name},

      Kami mohon maaf, tetapi pendaftaran Anda sebagai dokter telah ditolak. 
      Silakan hubungi tim kami untuk informasi lebih lanjut.

      Terima kasih atas pengertiannya.

      Salam hangat,
      ObesiFit Team
    `,
  };

  await transporter.sendMail(mailOptions);
};
