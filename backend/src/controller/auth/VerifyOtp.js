import userModels from "../../models/userTable.js";
import { SendOtpEmail, generateOtp } from "../../services/emailServices.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Controller verify otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    // Cek apakah OTP benar dan belum kadaluarsa
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP salah atau telah kadaluarsa." });
    }

    // Verifikasi berhasil, hapus OTP dari database
    await user.update({ otp: null, otpExpires: null, isVerified: true });

    res.status(200).json({ message: "Verifikasi email berhasil." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
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
  const { email } = req.body;

  try {
    const user = await userModels.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const { otp, otpExpires } = generateOtp();
    await user.update({ otp, otpExpires });

    await SendOtpEmail(email, otp);

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