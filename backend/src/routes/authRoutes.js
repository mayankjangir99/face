import express from 'express';
import {
  bootstrapAdmin,
  getBootstrapStatus,
  getCurrentUser,
  login,
  registerUser
} from '../controllers/authController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/auth/bootstrap-status', getBootstrapStatus);
router.post('/auth/bootstrap', bootstrapAdmin);
router.post('/auth/login', login);
router.get('/auth/me', protect, getCurrentUser);
router.post('/auth/register', protect, authorize('admin'), registerUser);

export default router;
