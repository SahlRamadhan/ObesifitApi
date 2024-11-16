import express from "express";
import { createKalkulatorBMI } from "../controller/kalkulatorbmi/kalkulatorBMIController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, verifyRole([2]), createKalkulatorBMI);

export default router;
