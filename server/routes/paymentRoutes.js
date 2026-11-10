import express from 'express';
import {
  createPayosPaymentLink,
  verifyPayosPayment,
  handlePayosWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Webhook public từ PayOS
router.post('/payos-webhook', handlePayosWebhook);

// Các route cần đăng nhập
router.post('/create-payos-link', protect, createPayosPaymentLink);
router.post('/verify-payos', protect, verifyPayosPayment);

export default router;

