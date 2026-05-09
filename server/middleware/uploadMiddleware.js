import multer from "multer";
import path from "path";

// Storage Engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File Filter
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Images and Videos Only!");
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50000000 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});