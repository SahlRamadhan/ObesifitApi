import Video from "../../models/videoTable.js";
import VideoFile from "../../models/videoFileTable.js";
import fs from "fs";
import dovenot from "dotenv";
dovenot.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:4000/public/";

const deleteOldFile = (filePath) => {
  const fullPath = `./public/${filePath}`; // Tambahkan path lengkap ke direktori public
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};


// Create Video
export const createVideo = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;

    const url = req.files.url ? `video/${req.files.url[0].filename}` : null;
    const thumbnail = req.files.thumbnail ? `thumbnails/video/${req.files.thumbnail[0].filename}` : null;

    const videoData = await Video.create({ judul, deskripsi });
    const videoFile = await VideoFile.create({
      video_id: videoData.id,
      url,
      thumbnail,
    });

    res.status(201).json({
      message: "Video created successfully",
      videoData,
      videoFile: {
        ...videoFile.dataValues,
        url: url ? `${BASE_URL}${url}` : null,
        thumbnail: thumbnail ? `${BASE_URL}${thumbnail}` : null,
      },
    });
  } catch (error) {
    if (req.files) {
      if (req.files.thumbnail) deleteOldFile(req.files.thumbnail[0].path);
      if (req.files.url) deleteOldFile(req.files.url[0].path);
    }
    res.status(500).json({ message: "Failed to create video", error });
  }
};

// Route: Get All Videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      include: [
        {
          model: VideoFile,
          as: "video_files",
          attributes: ["id", "url", "thumbnail"],
        },
      ],
    });

    const updateVideo = videos.map((video) => {
      const updatedFiles = video.video_files.map((file) => ({
        ...file.dataValues,
        url: file.url ? `${BASE_URL}${file.url}` : null,
        thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
      }));
      return { ...video.dataValues, video_files: updatedFiles };
    });

    res.status(200).json(updateVideo);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil video", error });
  }
};

// Route: Get Video By ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findOne({
      where: { id },
      include: [
        {
          model: VideoFile,
          as: "video_files",
          attributes: ["id", "url", "thumbnail"],
        },
      ],
    });

    if (!video) {
      return res.status(404).json({ message: "Video tidak ditemukan" });
    }

    const updatedFiles = video.video_files.map((file) => ({
      ...file.dataValues,
      url: file.url ? `${BASE_URL}${file.url}` : null,
      thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
    }));

    res.status(200).json({ ...video.dataValues, video_files: updatedFiles });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil video", error });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi } = req.body;

    // Cari video berdasarkan ID
    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Update judul dan deskripsi jika ada
    video.judul = judul || video.judul;
    video.deskripsi = deskripsi || video.deskripsi;
    await video.save();

    // Update file video atau thumbnail jika ada
    if (req.files) {
      const videoFile = await VideoFile.findOne({ where: { video_id: id } });
      if (!videoFile) return res.status(404).json({ message: "Video file not found" });

      // Update video file
      if (req.files.url) {
        deleteOldFile(videoFile.url); // Hapus file lama
        videoFile.url = `video/${req.files.url[0].filename}`; // Simpan file baru
      }

      // Update thumbnail
      if (req.files.thumbnail) {
        deleteOldFile(videoFile.thumbnail); // Hapus file lama
        videoFile.thumbnail = `thumbnails/video/${req.files.thumbnail[0].filename}`; // Simpan file baru
      }

      // Simpan perubahan ke database
      await videoFile.save();
    }

    // Ambil data terbaru setelah update
    const updatedVideo = await Video.findOne({
      where: { id },
      include: [
        {
          model: VideoFile,
          as: "video_files",
          attributes: ["id", "url", "thumbnail"],
        },
      ],
    });

    // Return data yang baru
    res.status(200).json({
      message: "Video updated successfully",
      video: {
        ...updatedVideo.dataValues,
        video_files: updatedVideo.video_files.map((file) => ({
          ...file.dataValues,
          url: file.url ? `${BASE_URL}${file.url}` : null,
          thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update video", error });
  }
};


// Delete Video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const videoFile = await VideoFile.findOne({ where: { video_id: id } });
    if (videoFile) {
      deleteOldFile(videoFile.url);
      deleteOldFile(videoFile.thumbnail);
      await videoFile.destroy();
    }

    await video.destroy();
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete video", error });
  }
};
