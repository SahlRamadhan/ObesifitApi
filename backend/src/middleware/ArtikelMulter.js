// multerArticle.js
import multer from "multer";
import path from "path";

// Fungsi untuk menentukan storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      cb(null, "public/thumbnails");
    } else if (file.fieldname === "images") {
      cb(null, "public/images/articles");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    if (file.fieldname === "thumbnail") {
      cb(null, "thumbnail-" + uniqueSuffix);
    } else if (file.fieldname === "images") {
      cb(null, "article-" + uniqueSuffix);
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
});

// Konfigurasi upload
const uploadArticle = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

export default uploadArticle;
