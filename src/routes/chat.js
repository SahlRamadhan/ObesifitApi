import express from "express";
import { createChat, fetchChat, fetchSession, sendMessage, closeSession, deleteSessionAndMessages, getAllSessions } from "../controller/chat/ChatController.js";

const router = express.Router();

// Membuat atau mendapatkan sesi konsultasi
router.post("/create", createChat);

// Mengambil riwayat chat untuk sesi tertentu
router.get("/session/:sessionId", fetchChat);

// Mengambil daftar sesi berdasarkan role
router.get("/session/:role/:id", fetchSession);

// Mengambil semua data sesi konsultasi
router.get("/session", getAllSessions);

// Mengirim pesan baru
router.post("/send", sendMessage);

// Menutup sesi konsultasi
router.post("/close/:sessionId", closeSession);

// Menghapus pesan
router.delete("/delete/:sessionId", deleteSessionAndMessages);

export default router;
