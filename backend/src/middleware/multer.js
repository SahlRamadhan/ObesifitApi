import multer from "multer";
import path from "path";

// Fungsi untuk menentukan storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tentukan folder tujuan berdasarkan fieldname
    if (file.fieldname === "sertifikat") {
      cb(null, "public/sertifikat"); // Folder untuk sertifikat
    } else if (file.fieldname === "images") {
      cb(null, "public/images"); // Folder untuk images
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    // Penamaan file berdasarkan fieldname
    if (file.fieldname === "sertifikat") {
      cb(null, "sertifikat-" + uniqueSuffix); // Nama file sertifikat
    } else if (file.fieldname === "images") {
      cb(null, "image-" + uniqueSuffix); // Nama file images
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
});

// Konfigurasi upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Filter jenis file
    const allowedTypes = {
      sertifikat: ["application/pdf", "image/jpeg", "image/png"],
      images: ["image/jpeg", "image/png", "image/jpg"],
    };

    if (allowedTypes[file.fieldname]) {
      if (allowedTypes[file.fieldname].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowedTypes[file.fieldname].join(", ")}`));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5 MB
});

export default upload;
