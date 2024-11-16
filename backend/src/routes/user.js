// userRoutes.js
import express from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, deleteAllUsers, verifyDoctor } from "../controller/auth/usersController.js";
import upload from "../middleware/multer.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", verifyToken, verifyRole([1,3]),getAllUsers);

// Get user by ID
router.get("/:id", verifyToken, verifyRole([2]), getUserById);

// Update user by ID
router.put("/update/:id",upload.fields([{ name: "images", maxCount: 1 },{ name: "sertifikat", maxCount: 1 },]),updateUser);

router.patch("/verify/:id", verifyToken, verifyRole([1]), verifyDoctor);

// Delete user by ID
router.delete("/:id", deleteUser);

// Delete all users (Admin only)
router.delete("/", deleteAllUsers);

export default router;
