import mongoose from 'mongoose';
import Product from './productModel.js';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating (1-5)'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple reviews for the same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { productId: productId, status: 'approved' },
    },
    {
      $group: {
        _id: '$productId',
        numOfReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numOfReviews: stats[0].numOfReviews,
      averageRating: stats[0].averageRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numOfReviews: 0,
      averageRating: 0,
    });
  }
};

// Recalculate average rating on save (when status is updated to 'approved')
reviewSchema.post('save', async function () {
  // this points to current review document
  await this.constructor.calculateAverageRating(this.productId);
});

// Recalculate average rating on delete / status changes
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.productId);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
