import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay with environment keys
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay configuration keys are missing in environment variables');
  }
  return new Razorpay({ key_id, key_secret });
};

// @desc    Create a new Razorpay order
// @route   POST /api/payments/razorpay-order
export const createRazorpayOrder = async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    res.status(400);
    return next(new Error('Amount is required'));
  }

  try {
    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay SDK error:', error.message);
    res.status(500);
    return next(new Error(`Razorpay order creation failed: ${error.message}`));
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify-signature
export const verifySignature = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    return next(new Error('Missing required verification fields'));
  }

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      throw new Error('Razorpay secret key is missing in environment variables');
    }
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', key_secret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400);
      return next(new Error('Invalid payment signature'));
    }
  } catch (error) {
    next(error);
  }
};
