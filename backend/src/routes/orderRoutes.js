import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPrescriptionStatus,
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createOrder)
  .get(protect, restrictTo('admin'), getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.put('/:id/status', protect, restrictTo('admin'), updateOrderStatus);
router.put('/:id/prescription', protect, restrictTo('admin'), updateOrderPrescriptionStatus);

export default router;
