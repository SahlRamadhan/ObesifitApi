import express from "express";
import { createTransaksi, verifySubscription, uploadPaymentProof, checkExpiredSubscription } from "../controller/transaksi/TransaksiController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";
import uploadBukti from "../middleware/BuktiMulter.js";

const router = express.Router();

router.post("/create", verifyToken, verifyRole([2]), createTransaksi);

router.post("/upload-bukti/:id", verifyToken, verifyRole([2]), uploadBukti.single("bukti_pembayaran"), uploadPaymentProof);

router.patch("/verify/:id", verifyToken, verifyRole([1]), verifySubscription);

router.get("/check-expired/:id", verifyToken, verifyRole([2]), checkExpiredSubscription);

export default router;