import express from 'express';
import {
  sendRegisterOtp,
  register,
  login,
  googleLogin,
  requestOtp,
  verifyOtpAndLogin,
  requestPasswordReset,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register/send-otp', sendRegisterOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtpAndLogin);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;
