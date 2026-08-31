import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { authStart, authFailure, authSuccess } from '../features/auth/authSlice.js';
import { registerApi, googleLoginApi, getErrorMessage } from '../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../features/cart/cartSlice.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import InAppBrowserNotice from '../components/common/InAppBrowserNotice.jsx';
import { isInAppBrowser, isAndroid, openInExternalBrowser } from '../utils/browserDetection.js';

// Zod Schema
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(authStart());
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      dispatch(authSuccess(response));
      showToast(`Welcome to CuraCare, ${response.user.name}!`, 'success');
      dispatch(syncCartWithBackend());
      navigate('/');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');
    }
  };

  const handleGoogleError = () => {
    showToast('Google Sign-Up failed. Please try again or use Email & Password.', 'error');
  };

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const response = await registerApi(data.name, data.email, data.password);
      dispatch(authSuccess(response));
      showToast(`Account created! Please verify your email code.`, 'success');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bdr-light transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-primary-500/20 mb-4">
            <img
              src="/logo.png"
              alt="CuraCare Icon"
              className="w-full h-full object-cover scale-[1.15]"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-txt-title">
            Create an Account
          </h2>
          <p className="text-sm text-txt-muted mt-2">
            Join CuraCare to order medicines and manage prescriptions
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8 rounded-3xl border border-bdr-main/10 shadow-xl">
          {/* In-App Browser Warning (e.g. LinkedIn / Instagram) */}
          <InAppBrowserNotice />

          {/* Email/Password Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

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

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              rightIcon={showConfirmPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bdr-light"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-bg-panel px-3 text-txt-muted">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          {isInAppBrowser() ? (
            <button
              type="button"
              onClick={() => {
                if (isAndroid()) {
                  openInExternalBrowser();
                } else {
                  showToast('Please tap (•••) at top right and choose Open in Safari.', 'info');
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-bdr-main/50 bg-bg-panel hover:bg-bdr-light text-txt-title text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign up with Google (Open in Browser)
            </button>
          ) : (
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
          )}

          {/* Login Switch */}
          <div className="mt-8 pt-6 border-t border-bdr-light text-center text-sm">
            <span className="text-txt-muted">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-display transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
