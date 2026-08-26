import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { authStart, authSuccess, authFailure } from '../features/auth/authSlice.js';
import { googleLoginApi, getErrorMessage } from '../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../features/cart/cartSlice.js';
import { useToast } from '../components/ui/Toast.jsx';

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
      sessionStorage.removeItem('login_form');
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
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-primary-500/20 mb-4">
            <img
              src="/logo.png"
              alt="CuraCare Icon"
              className="w-full h-full object-cover scale-[1.15]"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-txt-title">
            Welcome back to CuraCare
          </h2>
          <p className="text-sm text-txt-muted mt-2">
            Please sign in to continue
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-bdr-main/10 shadow-xl">


          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              shape="rectangular"
              size="large"
            />
          </div>

          {/* Social Links / Switch */}
          <div className="mt-8 pt-6 border-t border-bdr-light text-center text-sm">
            <span className="text-txt-muted">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-display transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;
