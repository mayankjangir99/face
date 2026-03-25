import express from 'express';
import {
  exportAttendanceCsv,
  exportAttendancePdf,
  getAnalyticsOverview,
  getAttendance,
  markAttendance
} from '../controllers/attendanceController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/mark-attendance', protect, authorize('admin', 'teacher'), markAttendance);
router.get('/attendance', protect, authorize('admin', 'teacher'), getAttendance);
router.get('/attendance/export/csv', protect, authorize('admin', 'teacher'), exportAttendanceCsv);
router.get('/attendance/export/pdf', protect, authorize('admin', 'teacher'), exportAttendancePdf);
router.get('/analytics/overview', protect, authorize('admin', 'teacher'), getAnalyticsOverview);

export default router;
