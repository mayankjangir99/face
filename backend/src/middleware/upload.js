import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { studentsUploadRoot } from '../config/paths.js';

const isServerless = process.env.VERCEL === '1';

if (!isServerless) {
  fs.mkdirSync(studentsUploadRoot, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, studentsUploadRoot);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || '.jpg';
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

const storage = isServerless ? multer.memoryStorage() : diskStorage;

const fileFilter = (_req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    return callback(null, true);
  }

  return callback(new Error('Only image uploads are supported.'));
};

export const studentImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: Number(process.env.MAX_IMAGE_UPLOADS || 6)
  }
});
