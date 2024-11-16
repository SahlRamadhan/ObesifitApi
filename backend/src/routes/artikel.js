import express from "express";
import { createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle } from "../controller/artikel/ArtikelController.js";
import uploadGambar from "../middleware/ArtikelMulter.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

// Get all articles
router.get("/", verifyToken, getAllArticles);

// Get article by slug
router.get("/:id", verifyToken, getArticleById);

// Create article
router.post("/create",verifyToken,verifyRole([1, 3]),uploadGambar.fields([{ name: "thumbnail", maxCount: 1 },{ name: "images", maxCount: 1 },]),createArticle);

// Update article
router.put("/update/:id",verifyToken,verifyRole([1, 3]),uploadGambar.fields([{ name: "thumbnail", maxCount: 1 },{ name: "images", maxCount: 1 },]),updateArticle);

// Delete article
router.delete("/delete/:id", verifyToken, verifyRole([1, 3]), deleteArticle);



export default router;