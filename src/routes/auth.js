import express from "express";
const router = express.Router();
import { refreshToken } from "../controller/auth/RefreshToken.js";
import { loginUser, logoutUser } from "../controller/auth/AuthController.js";
import { verifyOtp, resendOtp, requestResetPassword, resetPassword, verifyResetPassword } from "../controller/auth/VerifyOtp.js";
import { createUser } from "../controller/auth/usersController.js";
import upload from "../middleware/multer.js";

// User Login
router.post("/login", loginUser);

router.post("/register/user", upload.fields([{ name: "images", maxCount: 1 }]), createUser);

// Rute Pendaftaran untuk Dokter
router.post("/register/dokter", upload.fields([{ name: "sertifikat", maxCount: 1 }]), createUser);

// Verify OTP
router.post("/verifyOtp", verifyOtp);

// Resend OTP
router.post("/resendOtp", resendOtp);

// Request Reset Password
router.post("/requestResetPassword", requestResetPassword);

// Reset Password
router.post("/resetPassword", resetPassword);

// Verify Reset Password
router.post("/verifyResetPassword", verifyResetPassword);

// Refresh Token
router.get("/token", refreshToken);

// User Logout
router.delete("/logout", logoutUser);

export default router;
