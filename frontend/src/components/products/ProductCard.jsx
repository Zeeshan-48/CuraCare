import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toggleWishlist } from '../../features/cart/wishlistSlice.js';
import { addToCart, clearCart } from '../../features/cart/cartSlice.js';
import { useToast } from '../ui/Toast.jsx';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
    showToast(
      isWishlisted
        ? 'Removed from wishlist'
        : 'Added to wishlist',
      'success'
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    dispatch(clearCart());
    dispatch(addToCart({ product, quantity: 1 }));
    navigate('/checkout');
  };

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className="glass-card flex flex-col h-full relative overflow-hidden group">
      {/* Wishlist toggle */}
      <button
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl bg-bg-panel/80 border border-bdr-main/50 cursor-pointer transition-all duration-300 ${
          isWishlisted
            ? 'text-red-500 hover:text-red-600 scale-105'
            : 'text-txt-muted hover:text-red-500 hover:scale-105'
        }`}
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Prescription Required Badge */}
      {product.prescriptionRequired && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-500 text-white rounded-lg shadow-sm">
          Rx Required
        </span>
      )}

      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-12 left-3 z-10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-white rounded-lg shadow-sm">
          -{product.discount}% OFF
        </span>
      )}

      <Link to={`/products/${product._id}`} className="flex-1 flex flex-col">
        {/* Product Image */}
        <div className="w-full h-48 bg-bdr-light overflow-hidden relative flex items-center justify-center">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Meta */}
        <div className="p-5 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary-500">
                {product.brand}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                <Star size={12} fill="currentColor" />
                <span>{product.averageRating}</span>
              </div>
            </div>

            <h3 className="font-display font-bold text-txt-title text-base leading-tight group-hover:text-primary-500 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-txt-muted italic mt-0.5 mb-2 truncate">
              {product.genericName}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-bdr-light flex items-center justify-between">
            {/* Pricing */}
            <div>
              {product.discount > 0 ? (
                <div className="flex flex-col">
                  <span className="text-xs text-dark-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-lg font-bold text-txt-title font-display">
                    ${discountedPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-txt-title font-display">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart and Buy Now buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className="p-2.5 rounded-xl bg-bg-panel hover:bg-bdr-light border border-bdr-main/50 text-txt-title shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingCart size={16} />
              </button>
              <button
                onClick={handleBuyNow}
                className="px-3.5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/10 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
