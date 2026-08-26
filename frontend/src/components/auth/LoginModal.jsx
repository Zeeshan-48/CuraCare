import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';

import { authStart, authSuccess, authFailure, hideLoginModal } from '../../features/auth/authSlice.js';
import { loginApi, googleLoginApi, getErrorMessage } from '../../utils/api.js';
import { GoogleLogin } from '@react-oauth/google';
import { syncCartWithBackend } from '../../features/cart/cartSlice.js';
import { useToast } from '../ui/Toast.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

// Zod Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, isLoginModalOpen } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleClose = () => {
    dispatch(hideLoginModal());
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(authStart());
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      dispatch(authSuccess(response));
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      dispatch(syncCartWithBackend());
      handleClose();

      if (response.user.role === 'admin') {
        navigate('/admin');
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
      dispatch(authSuccess(response));
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      dispatch(syncCartWithBackend());
      handleClose();

      if (response.user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      dispatch(authFailure(errorMsg));
      showToast(errorMsg, 'error');
      
      if (error.response && error.response.status === 403) {
        handleClose();
        navigate('/verify-email', { state: { email: data.email } });
      }
    }
  };

  return (
    <Modal isOpen={isLoginModalOpen} onClose={handleClose} title="Sign In to Continue" size="sm">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <p className="text-sm text-txt-muted">
            Please log in to add items to your cart and complete your purchase.
          </p>
        </div>

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
              onClick={handleClose}
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
          />
        </div>

        <div className="mt-8 pt-6 border-t border-bdr-light text-center text-sm">
          <span className="text-txt-muted">Don't have an account? </span>
          <Link
            to="/register"
            onClick={handleClose}
            className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-display transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
