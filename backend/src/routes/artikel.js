import express from "express";
import { createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle } from "../controller/artikel/ArtikelController.js";
import uploadArticle from "../middleware/ArtikelMulter.js";

const router = express.Router();

// Get all articles
router.get("/", getAllArticles);

// Get article by slug
router.get("/:id", getArticleById);

// Create article
router.post(
  "/create",
  uploadArticle.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 1 },
  ]),
  createArticle
);

// Update article
router.put(
  "/update/:id",
  uploadArticle.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 1 },
  ]),
  updateArticle
);

// Delete article
router.delete("/:id", deleteArticle);

export default router;
