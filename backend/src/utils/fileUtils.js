import fs from 'fs/promises';
import path from 'path';
import { attendanceUploadRoot, backendRoot } from '../config/paths.js';

const sanitizeRelativePath = (filePath = '') => filePath.replace(/\\/g, '/').replace(/^\/+/, '');

export const buildFileUrl = (req, filePath) => {
  if (!filePath) {
    return '';
  }

  const normalizedPath = sanitizeRelativePath(filePath);
  return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
};

export const saveSnapshotFromDataUrl = async (snapshotDataUrl, prefix = 'attendance') => {
  if (!snapshotDataUrl) {
    return '';
  }

  const matches = snapshotDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Snapshot payload is not a valid base64 image.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extensionMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  };

  const extension = extensionMap[mimeType] || '.png';
  const fileName = `${prefix}-${Date.now()}${extension}`;
  const absolutePath = path.join(attendanceUploadRoot, fileName);

  await fs.mkdir(attendanceUploadRoot, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(base64Data, 'base64'));

  return `uploads/attendance/${fileName}`;
};

export const removeStoredFiles = async (filePaths = []) => {
  await Promise.all(
    filePaths.filter(Boolean).map(async (filePath) => {
      try {
        const normalizedPath = sanitizeRelativePath(filePath);
        await fs.unlink(path.join(backendRoot, normalizedPath));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Failed to remove file ${filePath}`, error);
        }
      }
    })
  );
};
