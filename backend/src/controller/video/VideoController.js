import Video from "../../models/videoTable.js";
import VideoFile from "../../models/videoFileTable.js";
import fs from "fs";

//route create
export const createVideo = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    // Pastikan kedua file telah diupload
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: "Video dan thumbnail harus diupload" });
    }

    const video = req.files.video[0].path;
    const thumbnail = req.files.thumbnail[0].path;

    const videoData = await Video.create({
      judul,
      deskripsi,
    });

    // Create the video file record
    const videoFile = await VideoFile.create({
      video_id: videoData.id,
      url: video,
      thumbnail: thumbnail,
    });

    res.status(201).json({ message: "Video created successfully", videoData, videoFile });
  } catch (error) {
    if (req.files) {
      if (req.files.thumbnail) fs.unlinkSync(req.files.thumbnail[0].path);
      if (req.files.video) fs.unlinkSync(req.files.video[0].path);
    }
    res.status(500).json({ message: "Failed to create video", error });
  }
};

//route get
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
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch videos", error });
  }
};

//route get by id
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
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch video", error });
  }
};

//route update
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi } = req.body;

    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update main video details
    video.judul = judul || video.judul;
    video.deskripsi = deskripsi || video.deskripsi;
    await video.save();

    // If new files are uploaded, replace them
    if (req.files) {
      const videoFile = await VideoFile.findOne({ where: { video_id: id } });

      if (!videoFile) {
        return res.status(404).json({ message: "Video file not found" });
      }

      if (req.files.video) {
        fs.unlinkSync(videoFile.url); // Delete old video file
        videoFile.url = req.files.video[0].path;
      }

      if (req.files.thumbnail) {
        fs.unlinkSync(videoFile.thumbnail); // Delete old thumbnail
        videoFile.thumbnail = req.files.thumbnail[0].path;
      }

      await videoFile.save();
    }

    res.status(200).json({ message: "Video updated successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Failed to update video", error });
  }
};

//route delete
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoFile = await VideoFile.findOne({ where: { video_id: id } });
    if (videoFile) {
      // Delete associated files
      fs.unlinkSync(videoFile.url);
      fs.unlinkSync(videoFile.thumbnail);
      await videoFile.destroy();
    }

    // Delete the video record
    await video.destroy();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete video", error });
  }
};

