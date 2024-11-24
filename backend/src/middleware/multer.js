import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      images: path.join(__dirname, "../public/images"),
      sertifikat: path.join(__dirname, "../public/sertifikat"),
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


const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: ["image/jpeg", "image/png", "image/jpg"],
    sertifikat: ["application/pdf", "image/jpeg", "image/png"],
  };

  if (allowedTypes[file.fieldname]) {
    if (allowedTypes[file.fieldname].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes[file.fieldname].join(", ")} formats are allowed for ${file.fieldname}`));
    }
  } else {
    cb(new Error("Unknown field name. Allowed fields: images, sertifikat"));
  }
};


// Konfigurasi upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
