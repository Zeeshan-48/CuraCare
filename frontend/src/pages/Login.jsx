import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';

import { authStart, authSuccess, authFailure } from '../features/auth/authSlice.js';
import { loginApi, googleLoginApi, getErrorMessage } from '../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../features/cart/cartSlice.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

// Zod Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const storedValues = (() => {
    const saved = sessionStorage.getItem('login_form');
    return saved ? JSON.parse(saved) : {};
  })();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: storedValues,
  });

  const formValues = watch();

  useEffect(() => {
    sessionStorage.setItem('login_form', JSON.stringify(formValues));
  }, [formValues]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('login_form');
    };
  }, []);

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

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const response = await loginApi(data.email, data.password);
      sessionStorage.removeItem('login_form');
      dispatch(authSuccess(response));
      showToast(`Welcome back, ${response.user.name}!`, 'success');

      // Sync local cart items with backend
      dispatch(syncCartWithBackend());

      // Route based on role or referrer
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');

      if (error.response && error.response.status === 403) {
        navigate('/verify-email', { state: { email: data.email } });
      }
    }
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
            Please enter your details to sign in
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-bdr-main/10 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-end text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-display transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bdr-light"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-bg-panel px-3 text-txt-muted">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              shape="rectangular"
              size="large"
              width="100%"
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

        {/* Quick Credentials Info Box for portfolio review */}
        <div className="mt-6 p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-500/20 text-xs text-left">
          <p className="font-semibold text-primary-500 mb-1.5 font-display">
            Demo Accounts (Pre-configured):
          </p>
          <div className="grid grid-cols-2 gap-2 text-txt-muted">
            <div>
              <p className="font-medium text-txt-title">Customer Logins:</p>
              <p>john@gmail.com</p>
              <p>customerpassword123</p>
            </div>
            <div>
              <p className="font-medium text-txt-title">Admin Logins:</p>
              <p>admin@curacare.com</p>
              <p>adminpassword123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
