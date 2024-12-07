import express from "express";
import { createKalkulatorKalori } from "../controller/kalkulatorkalori/KalkulatorKaloriController.js";


const router = express.Router();


router.post("/create",  createKalkulatorKalori);

export default router;