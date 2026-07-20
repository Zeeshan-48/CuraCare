import Cart from '../models/cartModel.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name price discount stock images brand genericName prescriptionRequired',
    });

    if (!cart) {
      // Create empty cart for user if none exists
      cart = await Cart.create({
        userId: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's cart (Overwrite entire cart items list)
// @route   PUT /api/cart
// @access  Private
export const updateCart = async (req, res, next) => {
  const { items } = req.body;

  try {
    if (!Array.isArray(items)) {
      res.status(400);
      return next(new Error('Invalid items format. Must be an array.'));
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items,
      });
    } else {
      cart.items = items;
      await cart.save();
    }

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price discount stock images brand genericName prescriptionRequired',
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};
