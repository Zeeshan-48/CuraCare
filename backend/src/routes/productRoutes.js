import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAiRecommendations,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, restrictTo('admin'), createProduct);

router.route('/recommendations').post(getAiRecommendations);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, restrictTo('admin'), updateProduct)
  .delete(protect, restrictTo('admin'), deleteProduct);

export default router;
