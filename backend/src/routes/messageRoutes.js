import express from 'express';
import { submitMessage, getMessages } from '../controllers/messageController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(submitMessage)
  .get(protect, restrictTo('admin'), getMessages);

export default router;
