import express from "express";
import { createKalkulatorKalori } from "../controller/kalkulatorkalori/KalkulatorKaloriController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();


router.post("/create", verifyToken, verifyRole([2]), createKalkulatorKalori);

export default router;