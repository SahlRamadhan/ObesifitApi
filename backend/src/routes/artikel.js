import express from "express";
import { createArticle, deleteArticle, deleteAllArticles, getArticleBySlug, updateArticle, getArticles } from "../controller/artikel/ArtikelController.js";
import uploadGambar from "../middleware/ArtikelMulter.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

// Get all articles
router.get("/", verifyToken, getArticles);

// Get article by slug
router.get("/:slug", verifyToken, getArticleBySlug);

// Create article
router.post("/create", verifyToken, verifyRole([1, 3]), uploadGambar.array("images", 5), createArticle);

// Update article
router.put("/update/:id", verifyToken, verifyRole([1, 3]), uploadGambar.array("images", 5), updateArticle);

// Delete article
router.delete("/delete/:id", verifyToken, verifyRole([1, 3]), deleteArticle);

// Delete all articles
router.delete("/", verifyToken, verifyRole([1, 3]), deleteAllArticles);

export default router;