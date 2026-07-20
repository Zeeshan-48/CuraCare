import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

import ProductCard from '../components/products/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';

const Wishlist = () => {
  const wishlistItems = useSelector((state) => state.wishlist.items);

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-full bg-bdr-light/40 text-dark-400 flex items-center justify-center mb-6">
          <Heart size={44} />
        </div>
        <h2 className="text-2xl font-bold font-display text-txt-title mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-dark-500 dark:text-dark-450 max-w-sm mb-8 leading-relaxed">
          Tap the heart icons on products to save your preferred health items and medicines here.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg">
            Start Browsing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold font-display text-txt-title">
          My Saved Items
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          Keep track of your regular supplements and medications for quick ordering.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wishlistItems.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
