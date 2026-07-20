import express from 'express';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getBanners)
  .post(protect, restrictTo('admin'), createBanner);

router
  .route('/:id')
  .delete(protect, restrictTo('admin'), deleteBanner);

export default router;
