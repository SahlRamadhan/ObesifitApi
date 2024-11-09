import multer from "multer";
import path from "path";

// Fungsi untuk menentukan storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      images: "public/images",
      sertifikat: "public/sertifikat",
    };
    cb(null, destinations[file.fieldname] || new Error("Unknown field name"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    const prefixes = {
      images: "profile-",
      sertifikat: "sertifikat-",
    };
    cb(null, prefixes[file.fieldname] + uniqueSuffix || new Error("Unknown field name"));
  },
});

// Filter untuk file
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: ["image/jpeg", "image/png", "image/jpg"],
    sertifikat: ["application/pdf", "image/jpeg", "image/png"],
  };

  if (allowedTypes[file.fieldname]) {
    cb(null, allowedTypes[file.fieldname].includes(file.mimetype) || new Error(`Only ${allowedTypes[file.fieldname].join(", ")} formats are allowed for ${file.fieldname}`));
  } else {
    cb(new Error("Unknown field name"));
  }
};

// Konfigurasi upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
