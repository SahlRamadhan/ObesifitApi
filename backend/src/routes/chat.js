import express from "express";
import { createChat, fetchChat, fetchSession, sendMessage } from "../controller/chat/ChatController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createChat);
router.get("/session/:sessionId", verifyToken, fetchChat);
router.get("/session/:role/:id", verifyToken, fetchSession);
router.post("/send", verifyToken, sendMessage);

export default router;
