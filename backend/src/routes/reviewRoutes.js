import express from 'express';
import {
  createReview,
  getProductReviews,
  updateReviewStatus,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.put('/:id/status', protect, restrictTo('admin'), updateReviewStatus);

export default router;
