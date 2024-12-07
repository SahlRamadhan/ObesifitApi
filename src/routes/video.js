import { createVideo, getAllVideos, getVideoById, deleteVideo, updateVideo, } from "../controller/video/VideoController.js";
import express from "express";
import upload from "../middleware/VideoMulter.js";

const router = express.Router();

router.get("/", getAllVideos);

router.post("/create", upload.fields([{ name: "thumbnail", maxCount: 1 },{ name: "url", maxCount: 1 },]),createVideo);

router.get("/:id",getVideoById);

router.put("/update/:id",  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "url", maxCount: 1 },]), updateVideo);

router.delete("/:id",  deleteVideo);



export default router;
