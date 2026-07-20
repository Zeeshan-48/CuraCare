import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Heart, ShoppingCart, AlertCircle, CheckCircle, Clock } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getProductByIdApi, getProductReviewsApi, createReviewApi, getErrorMessage } from '../utils/api.js';
import { addToCart, clearCart } from '../features/cart/cartSlice.js';
import { toggleWishlist } from '../features/cart/wishlistSlice.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';

// Local Mock Reviews Database keyed by Product ID
const INITIAL_REVIEWS = {
  prod_1: [
    { name: 'Alice Smith', rating: 5, comment: 'Relieved my migraine within 30 minutes! Highly recommended.', date: 'July 10, 2026' },
    { name: 'Michael Brown', rating: 4, comment: 'Good painkiller, but avoid taking it close to bedtime due to the caffeine content.', date: 'July 05, 2026' },
  ],
  prod_3: [
    { name: 'Emma Watson', rating: 5, comment: 'Excellent multivitamins, noticed a great improvement in my energy levels.', date: 'June 28, 2026' },
  ],
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item._id === id);

  // Tab State
  const [activeTab, setActiveTab] = useState('uses');

  // Quantity Selector
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');

  // Fetch Product details
  const { data: product, isLoading: productLoading, refetch: refetchProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductByIdApi(id),
    enabled: !!id,
  });

  // Fetch Reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviewsApi(id),
    enabled: !!id,
  });

  const reviews = reviewsData || [];

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-txt-muted text-sm font-semibold">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-txt-title mb-4">
          Medicine Not Found
        </h2>
        <p className="text-dark-500 mb-6">The item you are searching for is unavailable or invalid.</p>
        <Link to="/products">
          <Button variant="primary">Return to Products</Button>
        </Link>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    showToast(`Added ${quantity} ${product.name} to cart`, 'success');
  };

  const handleBuyNow = () => {
    dispatch(clearCart());
    dispatch(addToCart({ product, quantity }));
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    try {
      await createReviewApi(id, userRating, userComment);
      setUserComment('');
      showToast('Your review has been submitted successfully!', 'success');
      refetchReviews();
      refetchProduct();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Breadcrumb nav */}
      <div className="text-xs font-semibold text-dark-400 dark:text-dark-500 mb-6">
        <Link to="/" className="hover:text-primary-500">Home</Link> &nbsp;&gt;&nbsp;&nbsp;
        <Link to="/products" className="hover:text-primary-500">Products</Link> &nbsp;&gt;&nbsp;&nbsp;
        <span className="text-txt-main">{product.name}</span>
      </div>

      {/* Main Split Info Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
        {/* Left Column: Product Image */}
        <div className="glass-panel p-4 rounded-3xl overflow-hidden bg-bg-panel border border-dark-100 dark:border-dark-850 flex items-center justify-center h-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* Right Column: Key Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-950/80 text-primary-500 text-xs font-bold uppercase tracking-wider font-display">
                {product.brand}
              </span>
              {product.prescriptionRequired && (
                <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 font-display">
                  <AlertCircle size={12} />
                  Rx Required
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold font-display text-txt-title leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-dark-500 dark:text-dark-450 italic mt-1">
              Generic Formula: {product.genericName}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="font-semibold text-txt-title">
              {product.averageRating}
            </span>
            <span className="text-dark-400">({reviews.length} customer reviews)</span>
          </div>

          <p className="text-sm text-txt-muted leading-relaxed">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 py-2 border-y border-dark-50 dark:border-dark-900/60">
            {product.discount > 0 ? (
              <>
                <span className="text-3xl font-extrabold font-display text-txt-title">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-base text-dark-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                  Save {product.discount}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold font-display text-txt-title">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status & Quantity Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">
                    In Stock ({product.stock} units available)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Out of Stock</span>
                </>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center border border-bdr-main rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-dark-850 dark:text-white select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-2 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="grow gap-2 border-primary-200 text-primary-500 hover:bg-primary-50/20"
              disabled={product.stock === 0}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="primary"
              className="grow gap-2"
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
            <Button
              onClick={handleToggleWishlist}
              variant="outline"
              className="p-3.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-500"
            >
              <Heart size={18} className={isWishlisted ? 'text-red-500 fill-current' : ''} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Info Pane */}
      <div className="glass-panel p-8 rounded-3xl mb-16 text-left">
        {/* Tabs Bar */}
        <div className="flex border-b border-bdr-light pb-3 gap-6 mb-6">
          <button
            onClick={() => setActiveTab('uses')}
            className={`font-display font-semibold text-sm pb-1.5 cursor-pointer border-b-2 transition-all ${activeTab === 'uses'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-500 hover:text-dark-800 dark:hover:text-white'
              }`}
          >
            Uses & Indications
          </button>
          <button
            onClick={() => setActiveTab('dosage')}
            className={`font-display font-semibold text-sm pb-1.5 cursor-pointer border-b-2 transition-all ${activeTab === 'dosage'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-500 hover:text-dark-800 dark:hover:text-white'
              }`}
          >
            Recommended Dosage
          </button>
          <button
            onClick={() => setActiveTab('sideEffects')}
            className={`font-display font-semibold text-sm pb-1.5 cursor-pointer border-b-2 transition-all ${activeTab === 'sideEffects'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-500 hover:text-dark-800 dark:hover:text-white'
              }`}
          >
            Side Effects & Warnings
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-sm text-dark-600 dark:text-dark-350 leading-relaxed font-sans min-h-25">
          {activeTab === 'uses' && <p>{product.uses}</p>}
          {activeTab === 'dosage' && <p>{product.dosage}</p>}
          {activeTab === 'sideEffects' && <p>{product.sideEffects}</p>}
        </div>
      </div>

      {/* Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left pane: Write a Review */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl">
          <h3 className="font-display font-bold text-lg text-txt-title mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="text-amber-500 focus:outline-none cursor-pointer"
                  >
                    <Star size={24} fill={star <= userRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                Your Review
              </label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows="4"
                placeholder="Share your experience with this medication..."
                required
                className="form-input text-sm resize-none"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Submit Review
            </Button>
          </form>
        </div>

        {/* Right pane: Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-lg text-txt-title">
            Customer Reviews ({reviews.length})
          </h3>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev, index) => (
                <div key={index} className="glass-panel p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-display font-bold text-sm text-txt-title">
                        {rev.userId?.name || rev.name || 'Anonymous User'}
                      </h4>
                      <span className="text-[10px] text-dark-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(rev.createdAt || rev.date || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-350 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-txt-muted italic py-4">No reviews written for this product yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
