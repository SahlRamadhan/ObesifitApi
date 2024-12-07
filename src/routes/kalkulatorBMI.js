import express from "express";
import { createKalkulatorBMI } from "../controller/kalkulatorbmi/KalkulatorBMIController.js";


const router = express.Router();

router.post("/create", createKalkulatorBMI);

export default router;
