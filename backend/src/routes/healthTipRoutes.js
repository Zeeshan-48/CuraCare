import express from 'express';
import { getHealthTips, createHealthTip, deleteHealthTip } from '../controllers/healthTipController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getHealthTips)
  .post(protect, restrictTo('admin'), createHealthTip);

router
  .route('/:id')
  .delete(protect, restrictTo('admin'), deleteHealthTip);

export default router;
