import express from "express";
import { rateArticle, getArticleRatings, updateRating, deleteRating } from "../controller/artikel/RattingController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";


const router = express.Router();


router.post("/rate", verifyToken, rateArticle);
router.get("/rate/:article_id", getArticleRatings);
router.put("/rate/:article_id",  verifyToken, verifyRole([1,3]), updateRating);
router.delete("/rate/:article_id", verifyToken, deleteRating);

export default router;