import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  UserCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import {
  getProductsApi,
  getCategoriesApi,
  getBannersApi,
  getTestimonialsApi,
  getHealthTipsApi,
} from '../utils/api.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  // Banner State
  const [currentBanner, setCurrentBanner] = useState(0);

  // Fetch Banners
  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBannersApi,
  });

  // Fetch Testimonials
  const { data: testimonialsData, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonialsApi,
  });

  // Fetch Health Tips
  const { data: healthTipsData, isLoading: healthTipsLoading } = useQuery({
    queryKey: ['health-tips'],
    queryFn: getHealthTipsApi,
  });

  // Fetch Categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
  });

  // Fetch Best Selling Products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { isBestSeller: 'true' }],
    queryFn: () => getProductsApi({ isBestSeller: 'true', limit: 4 }),
  });

  const categories = categoriesData || [];
  const products = productsData?.products || [];
  const banners = bannersData || [];
  const testimonials = testimonialsData || [];
  const healthTips = healthTipsData || [];

  // Auto Slider for Banners
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* 1. Hero Promo Banner Slider */}
      {bannersLoading ? (
        <div className="w-full h-137.5 bg-bg-panel rounded-3xl max-w-7xl mx-auto flex items-center justify-center border border-bdr-light/50 shadow-sm text-txt-muted text-sm">
          Loading promotions...
        </div>
      ) : banners.length > 0 ? (
        <div className="relative w-full h-137.5 overflow-hidden bg-bg-panel rounded-3xl max-w-7xl mx-auto border border-bdr-light/50 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                const swipeThreshold = 50; // minimum drag distance in pixels to trigger slide transition
                if (info.offset.x < -swipeThreshold) {
                  // Swiped left -> Go to Next Slide
                  setCurrentBanner((currentBanner + 1) % banners.length);
                } else if (info.offset.x > swipeThreshold) {
                  // Swiped right -> Go to Previous Slide
                  setCurrentBanner((currentBanner - 1 + banners.length) % banners.length);
                }
              }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
            >
              {/* Blending Gradient Overlay - Adapts seamlessly to light/dark panel theme */}
              <div className="absolute inset-0 bg-gradient-to-r from-bg-panel via-bg-panel/75 to-transparent z-10 pointer-events-none" />
              {banners[currentBanner] && (
                <>
                  <img
                    src={banners[currentBanner].image}
                    alt="Healthcare Banner"
                    className="w-full h-full object-cover opacity-85 dark:opacity-75 pointer-events-none"
                  />
                  {/* Banner Captions */}
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-center items-start text-left pl-8 sm:pl-16 pr-6 z-20 max-w-2xl">
                    <span className="px-3.5 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-4 font-display">
                      Medical Excellence
                    </span>
                    <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight text-txt-title m-0">
                      {banners[currentBanner].title}
                    </h1>
                    <p className="text-sm sm:text-base text-txt-muted mt-4 mb-8 leading-relaxed">
                      {banners[currentBanner].subtitle}
                    </p>
                    <Link to={banners[currentBanner].link}>
                      <Button variant="primary" size="lg">
                        Shop Products
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Sliders Navigation */}
          <button
            onClick={() =>
              setCurrentBanner(
                (currentBanner - 1 + banners.length) % banners.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-bg-panel/80 hover:bg-bg-panel text-txt-main border border-bdr-light/80 shadow-md cursor-pointer transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentBanner((currentBanner + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-bg-panel/80 hover:bg-bg-panel text-txt-main border border-bdr-light/80 shadow-md cursor-pointer transition-all duration-200 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}

      {/* 2. Category Grid Quick Links */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest font-display">
              Categories
            </span>
            <h2 className="text-3xl font-extrabold font-display text-txt-title mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-primary-500 hover:text-primary-650"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categoriesLoading ? (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">Loading categories...</div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="glass-card p-6 flex flex-col items-center justify-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <h3 className="font-display font-bold text-sm text-txt-title group-hover:text-primary-500 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 4. Why Choose Us Section */}
      <div className="bg-primary-500/5 dark:bg-primary-950/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest font-display">
              Core Benefits
            </span>
            <h2 className="text-3xl font-extrabold font-display text-txt-title mt-1">
              Why Choose CuraCare
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <div className="glass-panel p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-500 flex items-center justify-center mb-6">
                <UserCheck size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-txt-title mb-3">
                Licensed Pharmacists
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed">
                All uploaded prescriptions are thoroughly verified by certified pharmacists before we package or dispatch.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-500 flex items-center justify-center mb-6">
                <Truck size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-txt-title mb-3">
                Express Delivery
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed">
                We deliver right to your door with temperature-controlled shipping methods to preserve drug stability.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-500 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-txt-title mb-3">
                Secure & Certified
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed">
                Every transaction and medical document is secured with end-to-end encryption complying with regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Best Selling Products Carousel Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest font-display">
              Best Sellers
            </span>
            <h2 className="text-3xl font-extrabold font-display text-txt-title mt-1">
              Top Selling Medications
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-primary-500 hover:text-primary-650"
          >
            See More
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productsLoading ? (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">Loading products...</div>
          ) : (
            products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))
          )}
        </div>
      </div>

      {/* 6. Testimonials Section */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest font-display">
            Patient Stories
          </span>
          <h2 className="text-3xl font-extrabold font-display text-txt-title mt-1">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {testimonialsLoading ? (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">Loading testimonials...</div>
          ) : testimonials.length > 0 ? (
            testimonials.map((t) => (
              <div key={t._id || t.id} className="glass-panel p-8 rounded-3xl relative">
                <Quote className="absolute right-6 top-6 text-primary-500/10 w-16 h-16 pointer-events-none" />
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <h4 className="font-display font-bold text-txt-title text-base">
                      {t.name}
                    </h4>
                    <p className="text-xs text-txt-muted/80">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-txt-muted leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">No testimonials yet.</div>
          )}
        </div>
      </div>

      {/* 7. Latest Health Tips */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest font-display">
              Tips & Advice
            </span>
            <h2 className="text-3xl font-extrabold font-display text-txt-title mt-1">
              Latest Health Tips
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {healthTipsLoading ? (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">Loading health tips...</div>
          ) : healthTips.length > 0 ? (
            healthTips.map((tip) => (
              <div
                key={tip._id || tip.id}
                className="glass-panel rounded-3xl overflow-hidden border border-dark-100 dark:border-dark-850 flex flex-col sm:flex-row group"
              >
                <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 text-left">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-primary-500">
                      {tip.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-txt-title mt-1.5 mb-2 group-hover:text-primary-500 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-txt-muted leading-normal line-clamp-3">
                      {tip.excerpt}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary-500 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Article &rarr;
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-txt-muted text-sm">No health tips available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
