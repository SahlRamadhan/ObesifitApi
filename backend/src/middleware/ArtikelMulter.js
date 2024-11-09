// multerArticle.js
import multer from "multer";
import path from "path";

const storageArticle = multer.diskStorage({
  destination: "public/images/articles",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    cb(null, "article-" + uniqueSuffix);
  },
});

const fileFilterArticle = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG formats are allowed for article images"));
  }
};

const uploadArticle = multer({
  storage: storageArticle,
  fileFilter: fileFilterArticle,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 2MB
});

export default uploadArticle;
