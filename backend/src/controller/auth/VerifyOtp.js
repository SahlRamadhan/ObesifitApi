import userModels from "../../models/userTable.js";
import { resetPasswordOtp, generateOtp } from "../../services/resetPassword.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });

    if (!user) {
      console.log("Email tidak ditemukan:", email);
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    console.log("OTP di database:", user.otp);
    console.log("OTP yang diterima:", otp);
    console.log("Waktu kadaluarsa di database:", user.otpExpires);
    console.log("Waktu sekarang:", new Date());

    // Cek apakah OTP benar
    if (user.otp !== otp) {
      console.error("OTP tidak cocok.");
      return res.status(400).json({ message: "OTP salah." });
    }

    // Cek apakah OTP belum kadaluarsa
    if (new Date(user.otpExpires) < new Date()) {
      console.error("OTP telah kadaluarsa.");
      return res.status(400).json({ message: "OTP telah kadaluarsa." });
    }

    // Verifikasi berhasil
    await user.update({ otp: null, otpExpires: null, isVerified: true });
    console.log("OTP diverifikasi dan data user diperbarui.");

    res.status(200).json({ message: "Verifikasi email berhasil." });
  } catch (error) {
    console.error("Error di backend:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan di server", error: error.message });
  }
};


// Controller resend otp
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const { otp, otpExpires } = generateOtp();
    await user.update({ otp, otpExpires });

    await SendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP berhasil dikirim ulang ke email Anda." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

// Controller request reset password
export const requestResetPassword = async (req, res) => {
  const { email} = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const { otp, otpExpires } = generateOtp();
    await user.update({ otp, otpExpires });

    await resetPasswordOtp(email, otp, user.name);

    res.status(200).json({ message: "OTP berhasil dikirim ke email Anda." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

//Controller verify reset password
export const verifyResetPassword = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP salah atau telah kadaluarsa." });
    }

    await user.update({ otp: null, otpExpires: null });

    const resetPassword = jwt.sign({ userId: user.id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: "1d" });

    res.cookie("resetPassword", resetPassword, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });


    res.status(200).json({ message: "OTP benar." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

//Controller reset password
export const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { resetPassword } = req.cookies;

  try {
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi password harus diisi." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi password harus sama." });
    }


    const decoded = jwt.verify(resetPassword, process.env.RESET_PASSWORD_SECRET);
    const user = await userModels.findOne({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan." });
    }

    const hashPassword = await getHashedPassword(password, user.password);
    await user.update({ password: hashPassword });

    res.clearCookie("resetPassword");
    res.status(200).json({ message: "Password berhasil direset." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

const getHashedPassword = async (newPassword, currentPassword) => {
  if (!newPassword) return currentPassword; 
  return await bcrypt.hash(newPassword, 10); 
}