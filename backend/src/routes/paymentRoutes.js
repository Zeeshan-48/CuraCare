import express from 'express';
import { createRazorpayOrder, verifySignature } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/verify-signature', protect, verifySignature);

export default router;
