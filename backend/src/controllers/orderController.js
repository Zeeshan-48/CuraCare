import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const {
    items,
    shippingAddress,
    prescriptionImage,
    couponCode,
    discountAmount,
    tax,
    shippingCharges,
    totalAmount,
    paymentMethod,
    transactionId,
  } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No order items provided'));
    }

    // 1. Verify product inventory and deduct stock, also check if prescription is required
    let requiresPrescription = false;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        return next(new Error(`Product ${item.name || 'with ID ' + item.productId} not found`));
      }
      if (product.prescriptionRequired) {
        requiresPrescription = true;
      }
      if (product.stock < item.quantity) {
        res.status(400);
        return next(
          new Error(
            `Insufficient stock for ${product.name}. Available stock: ${product.stock}, requested: ${item.quantity}`
          )
        );
      }
      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    // 2. Enforce prescription if required
    if (requiresPrescription && (!prescriptionImage || prescriptionImage.trim() === '')) {
      res.status(400);
      return next(new Error('A prescription is required for one or more items in this order. Please upload a prescription.'));
    }

    // 3. Create Order in Database
    const order = await Order.create({
      userId: req.user._id,
      items,
      shippingAddress,
      prescriptionImage,
      prescriptionStatus: requiresPrescription ? 'pending' : 'none',
      transactionId: paymentMethod === 'razorpay' ? (transactionId || 'simulated_payment_id') : '',
      couponCode,
      discountAmount,
      tax,
      shippingCharges,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'completed' : 'pending',
    });

    // 3. Clear user's shopping cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate('userId', 'name email');

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    // Authorization check: User must be either admin or the creator of the order
    if (
      req.user.role !== 'admin' &&
      order.userId._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      return next(new Error('Not authorized to view this order'));
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order prescription status
// @route   PUT /api/orders/:id/prescription
// @access  Private/Admin
export const updateOrderPrescriptionStatus = async (req, res, next) => {
  const { id } = req.params;
  const { prescriptionStatus } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    if (prescriptionStatus) {
      order.prescriptionStatus = prescriptionStatus;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
