import multer from "multer";
import path from "path";

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, "public/video"); // Save videos in 'public/videos'
    } else if (file.fieldname === "thumbnail") {
      cb(null, "public/thumbnails"); // Save thumbnails in 'public/thumbnails'
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    if (file.fieldname === "video") {
      cb(null, "video-" + uniqueSuffix);
    } else if (file.fieldname === "thumbnail") {
      cb(null, "thumbnail-" + uniqueSuffix);
    }
  },
});

// File filter for video and image
const fileFilter = (req, file, cb) => {
  const allowedVideo = /mp4|avi|mkv/;
  const allowedImage = /jpg|jpeg|png/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === "video" && allowedVideo.test(extname) && mimetype.startsWith("video/")) {
    cb(null, true); // Allow video
  } else if (file.fieldname === "thumbnail" && allowedImage.test(extname) && mimetype.startsWith("image/")) {
    cb(null, true); // Allow image
  } else {
    cb(new Error("File type not allowed"), false); // Reject other files
  }
};

// Multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


export default upload;