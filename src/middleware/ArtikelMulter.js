// multerArticle.js
import multer from "multer";

// Fungsi untuk menentukan storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      thumbnail: "public/thumbnails/articles",
      images: "public/images/articles",
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
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Konfigurasi upload dengan batasan ukuran file
const uploadArticle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimum ukuran file 5MB
  },
});

export default uploadArticle;
