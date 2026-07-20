import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    prescriptionImage: {
      type: String,
      default: '',
    },
    prescriptionStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    transactionId: {
      type: String,
      default: '',
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay'],
      default: 'cod',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate tracking number
orderSchema.pre('save', function (next) {
  if (!this.trackingNumber) {
    // Generate tracking number like CC-1234-5678-ABCD
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let segments = [];
    for (let i = 0; i < 3; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    this.trackingNumber = `CC-${segments.join('-')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
