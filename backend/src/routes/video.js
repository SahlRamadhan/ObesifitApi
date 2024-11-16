import { createVideo, getAllVideos, getVideoById, deleteVideo, updateVideo, } from "../controller/video/VideoController.js";
import express from "express";
import upload from "../middleware/VideoMulter.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllVideos);

router.post("/create",verifyToken,verifyRole([1, 3]), upload.fields([{ name: "thumbnail", maxCount: 1 },{ name: "video", maxCount: 1 },]),createVideo);

router.get("/:id",verifyToken, getVideoById);

router.put("/update/:id", verifyToken, verifyRole([1, 3]), upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "video", maxCount: 1 },]), updateVideo);

router.delete("/:id", verifyToken, verifyRole([1, 3]), deleteVideo);



export default router;
