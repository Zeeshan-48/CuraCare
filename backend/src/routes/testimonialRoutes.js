import express from 'express';
import { getTestimonials, createTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getTestimonials)
  .post(protect, restrictTo('admin'), createTestimonial);

router
  .route('/:id')
  .delete(protect, restrictTo('admin'), deleteTestimonial);

export default router;
