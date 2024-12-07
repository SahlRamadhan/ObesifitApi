import multer from "multer";

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      url: "public/video",
      thumbnail: "public/thumbnails/video",
    };

    const dest = destinations[file.fieldname];
    if (dest) {
      cb(null, dest);
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    url: ["video/mp4", "video/avi", "video/mkv"],
    thumbnail: ["image/jpeg", "image/png", "image/jpg"],
  };

  if (allowedTypes[file.fieldname]?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`));
  }
};

// Konfigurasi upload dengan batasan ukuran file
const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // Maksimum ukuran file 50MB
  },
});

export default uploadVideo;
