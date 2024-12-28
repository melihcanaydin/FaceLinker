import multer from 'multer';
import fs from 'fs';
import path from 'path';

export const configureUpload = (config: { uploadDir: string; maxFileSize: number; allowedMimeTypes: string[] }) => {
  const { uploadDir, maxFileSize, allowedMimeTypes } = config;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type'));
      } else {
        cb(null, true);
      }
    },
  });
};