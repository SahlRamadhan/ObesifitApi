import multer from "multer";
import path from "path";

// Fungsi untuk menentukan storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/bukti");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
      cb(null, "bukti-" + uniqueSuffix);
    },
  });
  
  // Konfigurasi upload
const uploadBukti = multer({
    storage,
      fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"));
        }
      },
   });
  
export default uploadBukti;
  