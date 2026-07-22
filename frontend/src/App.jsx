import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './features/store.js';
import { ToastProvider } from './components/ui/Toast.jsx';

// Common Components & Layouts
import Layout from './components/common/Layout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Contact from './pages/Contact.jsx';
import FAQs from './pages/FAQs.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Wishlist from './pages/Wishlist.jsx';
import AIRecommendations from './pages/AIRecommendations.jsx';
import NotFound from './pages/NotFound.jsx';

import './App.css';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes inside standard layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="ai-recommendations" element={<AIRecommendations />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<FAQs />} />
                <Route path="privacy-policy" element={<Privacy />} />
                <Route path="terms-conditions" element={<Terms />} />
                <Route path="wishlist" element={<Wishlist />} />
                
                {/* Authentication Routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="signup" element={<Navigate to="/register" replace />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="verify-email" element={<VerifyEmail />} />

                {/* Protected Customer Routes */}
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Wildcard 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
