import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice.js';
import { useToast } from '../ui/Toast.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [isScrolled, setIsScrolled] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdown(false);
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Scroll handler to make navbar float or sit flush
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsOpen(false);
    setUserDropdown(false);
  }, [navigate]);

  const activeLinkStyle = ({ isActive }) =>
    `font-display text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${isActive
      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
      : 'text-dark-600 hover:text-primary-500 hover:bg-primary-50/50 dark:text-dark-300 dark:hover:text-primary-400 dark:hover:bg-dark-900/40'
    }`;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 ${isScrolled ? 'pt-4' : 'pt-0 md:pt-4'
        }`}
    >
      <nav
        className={`max-w-7xl mx-auto transition-all duration-300 ${isScrolled
          ? 'glass-panel rounded-2xl shadow-xl border border-color-white/20 dark:border-white/5 py-3'
          : 'glass-panel rounded-2xl shadow-md border border-color-dark-100 dark:border-dark-800 py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-primary-500/10 group-hover:rotate-12 transition-all duration-300 shrink-0">
                <img
                  src="/logo.png"
                  alt="CuraCare Icon"
                  className="w-full h-full object-cover scale-[1.15]"
                />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-txt-title leading-none">
                Cura<span className="text-primary-500">Care</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={activeLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/products" className={activeLinkStyle}>Products</NavLink>
              <NavLink to="/ai-recommendations" className={activeLinkStyle}>
                AI Guide
              </NavLink>
              {isAuthenticated && user?.role === 'admin' && (
                <NavLink to="/admin" className={activeLinkStyle}>
                  Admin Dashboard
                </NavLink>
              )}
              <NavLink to="/about" className={activeLinkStyle}>
                About Us
              </NavLink>
              <NavLink to="/contact" className={activeLinkStyle}>
                Contact
              </NavLink>
              <NavLink to="/faqs" className={activeLinkStyle}>
                FAQs
              </NavLink>
            </div>

            {/* Action Icons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted hover:text-primary-500 cursor-pointer transition-all duration-200"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted hover:text-primary-500 transition-all duration-200"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white font-sans text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted hover:text-primary-500 transition-all duration-200"
              >
                <ShoppingCart size={20} />
                {totalCartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-primary-500 text-white font-sans text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown / Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-bdr-main/60 hover:border-primary-300 dark:hover:border-primary-800 bg-bg-panel/40 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/80 flex items-center justify-center text-primary-500 font-display font-semibold text-sm">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-semibold text-txt-main max-w-20 truncate pr-1">
                      {user?.name.split(' ')[0]}
                    </span>
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-bg-panel border border-bdr-main shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-bdr-main">
                        <p className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                          Logged in as
                        </p>
                        <p className="text-xs font-semibold text-txt-main truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-txt-main hover:bg-primary-50 dark:hover:bg-dark-950/60 dark:hover:text-primary-400"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-txt-main hover:bg-primary-50 dark:hover:bg-dark-950/60 dark:hover:text-primary-400"
                      >
                        <User size={16} />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-txt-main hover:bg-primary-50 dark:hover:bg-dark-950/60 dark:hover:text-primary-400"
                      >
                        <ShoppingCart size={16} />
                        My Orders
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left cursor-pointer mt-1 border-t border-bdr-light pt-2"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="font-display text-sm font-semibold text-txt-main hover:text-primary-500 transition-colors px-2 py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="font-display text-sm font-semibold px-5 py-2.5 rounded-xl bg-linear-to-tr from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-550 text-white shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/15 hover:scale-[1.015] active:scale-95 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted cursor-pointer"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Cart Mobile */}
              <Link
                to="/cart"
                aria-label="Cart Link"
                className="relative p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted"
              >
                <ShoppingCart size={18} />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-500 text-white font-sans text-[9px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
                className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-900 text-txt-muted cursor-pointer"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel rounded-2xl shadow-2xl px-4 py-5 mt-2 space-y-4 max-w-7xl mx-auto">
          <div className="flex flex-col gap-1.5">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >Products</NavLink>
            <NavLink
              to="/ai-recommendations"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >
              AI Guide
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/faqs"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl font-display text-sm font-semibold text-left transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900'
                }`
              }
            >
              FAQs
            </NavLink>
          </div>

          <div className="border-t border-bdr-main pt-4 flex flex-col gap-2.5">
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900 rounded-xl"
            >
              <Heart size={18} className="text-red-500" />
              My Wishlist ({wishlistItems.length})
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900 rounded-xl"
                  >
                    <LayoutDashboard size={18} className="text-primary-500" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900 rounded-xl"
                >
                  <User size={18} className="text-primary-500" />
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900 rounded-xl"
                >
                  <ShoppingCart size={18} className="text-primary-500" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer mt-1"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl border border-bdr-main font-display text-sm font-semibold text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-primary-500 font-display text-sm font-semibold text-white shadow-md shadow-primary-500/10 hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
