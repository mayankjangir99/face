import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const backendRoot = path.resolve(__dirname, '..', '..');
export const uploadsRoot = path.join(backendRoot, 'uploads');
export const studentsUploadRoot = path.join(uploadsRoot, 'students');
export const attendanceUploadRoot = path.join(uploadsRoot, 'attendance');
