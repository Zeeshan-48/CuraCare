import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      return next(new Error('You have already reviewed this product'));
    }

    // Create review - Auto-approve for instant recalculation/visibility in demo
    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating: Number(rating),
      comment,
      status: 'approved', // Auto-approved for live simulation
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId, status: 'approved' })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Update review status (Admin only)
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const review = await Review.findById(id);

    if (!review) {
      res.status(404);
      return next(new Error('Review not found'));
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      return next(new Error('Invalid review status'));
    }

    review.status = status;
    await review.save();

    res.json(review);
  } catch (error) {
    next(error);
  }
};
