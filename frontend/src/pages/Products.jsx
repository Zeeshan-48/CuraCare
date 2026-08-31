import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, Search, ShieldCheck, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProductsApi, getCategoriesApi } from '../utils/api.js';
import ProductCard from '../components/products/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(100); // Max $100
  const [rxRequired, setRxRequired] = useState(null); // null = all, true = Rx, false = OTC
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Collapsible Filter States
  const [openSections, setOpenSections] = useState({
    categories: true, // Open by default so user sees it!
    rx: false,
    price: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
  });
  const categories = categoriesData || [];

  // Fetch Products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsApi({ limit: 100 }),
  });
  const products = productsData?.products || [];

  // Extract initial categories / search queries from URL params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');

    if (urlCategory) {
      setSelectedCategories([urlCategory]);
      setOpenSections(prev => ({ ...prev, categories: true }));
    } else {
      setSelectedCategories([]);
    }

    if (urlSearch) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // Handle category checklist clicks
  const handleCategoryChange = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Clear all filters handler
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(100);
    setRxRequired(null);
    setSortBy('featured');
    setSearchQuery('');
    setSearchParams({});
    setOpenSections({ categories: true, rx: false, price: false });
  };

  // Memoized Filtered & Sorted Products List
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.category?.name || p.category || '').toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const catName = p.category?.name || p.category;
        return selectedCategories.includes(catName);
      });
    }

    // 4. Price Limit Filter
    result = result.filter((p) => {
      const discountedPrice = p.price * (1 - (p.discount || 0) / 100);
      return discountedPrice <= priceRange;
    });

    // 5. Prescription Status Filter
    if (rxRequired !== null) {
      result = result.filter((p) => p.prescriptionRequired === rxRequired);
    }

    // 6. Sorting Operations
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.discount || 0) / 100);
        const pB = b.price * (1 - (b.discount || 0) / 100);
        return pA - pB;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.discount || 0) / 100);
        const pB = b.price * (1 - (b.discount || 0) / 100);
        return pB - pA;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, rxRequired, sortBy]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterDrawerOpen]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Page Title & Breadcrumbs */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold font-display text-txt-title">
          Healthcare Products
        </h1>
        <p className="text-sm text-txt-muted mt-1">
          Explore over-the-counter and prescription medicines verified by clinical pharmacists.
        </p>
      </div>

      {/* Grid Layout: Sidebar Filters + Product List */}
      <div className="relative">
        
        {/* Sidebar Filters Drawer */}
        <div className={`fixed inset-0 z-[/100] transition-opacity duration-300 ${isFilterDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          
          {/* Drawer Panel */}
          <div className={`absolute top-0 left-0 bottom-0 w-[85vw] max-w-[320px] glass-panel rounded-none rounded-r-3xl border-l-0 shadow-2xl transition-transform duration-300 flex flex-col ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-850 pb-4">
                <span className="font-display font-bold text-txt-title flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary-500" />
                  Filters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>

              {/* Categories checklist */}
              <div className="border-b border-dark-100 dark:border-dark-850 pb-4">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between font-display font-bold text-xs text-txt-title uppercase tracking-wider mb-2 cursor-pointer hover:text-primary-500 transition-colors"
                >
                  Categories
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.categories ? 'rotate-180 text-primary-500' : 'text-dark-400'}`} />
                </button>
                {openSections.categories && (
                  <div className="space-y-2.5 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2.5 text-sm text-dark-600 dark:text-dark-350 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleCategoryChange(cat.name)}
                          className="accent-primary-500 rounded border-dark-200"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescription Required checkbox */}
              <div className="border-b border-dark-100 dark:border-dark-850 pb-4">
                <button
                  onClick={() => toggleSection('rx')}
                  className="w-full flex items-center justify-between font-display font-bold text-xs text-txt-title uppercase tracking-wider mb-2 cursor-pointer hover:text-primary-500 transition-colors"
                >
                  Prescription Rule
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.rx ? 'rotate-180 text-primary-500' : 'text-dark-400'}`} />
                </button>
                {openSections.rx && (
                  <div className="space-y-2.5 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="flex items-center gap-2.5 text-sm text-dark-600 dark:text-dark-350 cursor-pointer">
                      <input
                        type="radio"
                        name="rx"
                        checked={rxRequired === null}
                        onChange={() => setRxRequired(null)}
                        className="accent-primary-500"
                      />
                      <span>All Products</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-dark-600 dark:text-dark-350 cursor-pointer">
                      <input
                        type="radio"
                        name="rx"
                        checked={rxRequired === true}
                        onChange={() => setRxRequired(true)}
                        className="accent-primary-500"
                      />
                      <span>Prescription (Rx) Required</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-dark-600 dark:text-dark-350 cursor-pointer">
                      <input
                        type="radio"
                        name="rx"
                        checked={rxRequired === false}
                        onChange={() => setRxRequired(false)}
                        className="accent-primary-500"
                      />
                      <span>Over-The-Counter (OTC)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Price range selector slider */}
              <div className="pb-2">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between font-display font-bold text-xs text-txt-title uppercase tracking-wider mb-2 cursor-pointer hover:text-primary-500 transition-colors"
                >
                  Max Price
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-500">${priceRange}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.price ? 'rotate-180 text-primary-500' : 'text-dark-400'}`} />
                  </div>
                </button>
                {openSections.price && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full accent-primary-500 bg-dark-100 dark:bg-dark-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-bdr-main/50 bg-bg-panel/90 backdrop-blur-md rounded-br-3xl">
              <Button className="w-full" onClick={() => setIsFilterDrawerOpen(false)}>
                Show {processedProducts.length} Results
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid & Controls */}
        <div className="w-full space-y-6">
          {/* Sorting / Catalog details bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 sm:p-4 rounded-2xl">
            {/* Desktop only result count */}
            <span className="text-xs font-semibold text-txt-muted hidden lg:inline-block">
              Showing {processedProducts.length} medicines
            </span>

            {/* Catalog search bar */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-xl bg-bdr-light border border-bdr-main text-xs outline-none text-txt-title focus:border-primary-500"
              />
            </div>

            {/* Filter and Sort Group - side by side on mobile */}
            <div className="flex items-center justify-between gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-500 text-white px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-bdr-light sm:bg-transparent px-2 py-2 sm:px-0 sm:py-0 rounded-xl border border-bdr-main sm:border-none">
                <ArrowUpDown size={14} className="text-dark-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto text-[11px] sm:text-xs font-bold sm:font-semibold bg-transparent outline-none text-txt-title sm:text-dark-800 dark:sm:text-dark-250 cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Low to High</option>
                  <option value="price-high">High to Low</option>
                  <option value="rating">Reviews</option>
                  <option value="discount">Savings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog items grid */}
          {productsLoading ? (
            <div className="text-center py-20 text-txt-muted text-sm font-semibold">
              Loading products inventory...
            </div>
          ) : processedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {processedProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-bdr-light/40 text-dark-450 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-txt-title mb-2">
                No Products Match Your Criteria
              </h3>
              <p className="text-sm text-txt-muted max-w-sm mx-auto mb-6">
                Try resetting or softening your search terms, categories, or price ranges.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
