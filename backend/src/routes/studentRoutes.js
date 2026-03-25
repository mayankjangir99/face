import express from 'express';
import { addStudent, deleteStudent, getStudents, updateStudent } from '../controllers/studentController.js';
import { authorize, protect } from '../middleware/auth.js';
import { studentImageUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/students', protect, getStudents);
router.post('/add-student', protect, authorize('admin'), studentImageUpload.array('images', 6), addStudent);
router.put('/students/:id', protect, authorize('admin'), studentImageUpload.array('images', 6), updateStudent);
router.delete('/delete-student/:id', protect, authorize('admin'), deleteStudent);

export default router;
