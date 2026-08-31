import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { authStart, authSuccess, authFailure } from '../features/auth/authSlice.js';
import { googleLoginApi, getErrorMessage } from '../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../features/cart/cartSlice.js';
import { useToast } from '../components/ui/Toast.jsx';
import InAppBrowserNotice from '../components/common/InAppBrowserNotice.jsx';

const Login = () => {
  const { isLoading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Redirect target
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(authStart());
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      dispatch(authSuccess(response));
      showToast(`Welcome back, ${response.user.name}!`, 'success');

      // Sync local cart items with backend
      dispatch(syncCartWithBackend());

      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');
    }
  };

  const handleGoogleError = () => {
    showToast('Google Sign-In failed. Please try again.', 'error');
  };

  return (
    <div className="grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-bdr-light transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 border border-bdr-main/20">
            <img
              src="/logo.png"
              alt="CuraCare Icon"
              className="w-full h-full object-cover scale-[1.15]"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-txt-title tracking-tight">
            Welcome to Cura<span className="text-primary-500">Care</span>
          </h2>
          <p className="text-sm text-txt-muted mt-2 max-w-sm">
            Sign in with your Google account to access your medicines, orders, and healthcare recommendations.
          </p>
        </div>

        {/* In-App Browser Warning & Chrome/Safari Chooser */}
        <InAppBrowserNotice />

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-bdr-main/10 shadow-xl flex flex-col items-center">
          <div className="flex justify-center w-full my-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              shape="rectangular"
              size="large"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-bdr-light text-center text-xs text-txt-muted">
            <span>By continuing, you agree to our </span>
            <Link
              to="/terms-conditions"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
            >
              Terms of Service
            </Link>
            <span> and </span>
            <Link
              to="/privacy-policy"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
