import express from "express";
import { createTransaksi, verifySubscription, uploadPaymentProof, checkExpiredSubscription, getAllTransaksi, getActiveSubscription } from "../controller/transaksi/TransaksiController.js";

import uploadBukti from "../middleware/BuktiMulter.js";

const router = express.Router();


router.get("/", getAllTransaksi);

router.get("/active/:id_user", getActiveSubscription);

router.post("/create", createTransaksi);

router.post("/uploadbukti/:id", uploadBukti.single("bukti_pembayaran"), uploadPaymentProof);

router.patch("/verify/:id",  verifySubscription);

router.get("/checkexpired/:id", checkExpiredSubscription);

export default router;