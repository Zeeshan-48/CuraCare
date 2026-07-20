import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

import { resetPasswordApi, getErrorMessage } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const resetPasswordSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    code: z.string().length(6, 'OTP code must be exactly 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Grab email passed in router state from ForgotPassword page
  const passedEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: passedEmail,
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isNaN(Number(data.code))) {
        throw new Error('OTP code must be numeric.');
      }
      
      const response = await resetPasswordApi(data.email, data.code, data.newPassword);
      showToast(response.message, 'success');
      navigate('/login');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-bdr-light transition-colors duration-300">
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
            Reset Password
          </h2>
          <p className="text-sm text-txt-muted mt-2">
            Enter the 6-digit OTP code sent to your email and select a new password
          </p>
        </div>

        {/* Form Card */}
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
              label="OTP Code (6 digits)"
              type="text"
              placeholder="123456"
              maxLength={6}
              error={errors.code?.message}
              {...register('code')}
            />

            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              rightIcon={showConfirmPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-8 pt-6 border-t border-bdr-light text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-sm text-dark-500 hover:text-primary-500 dark:text-dark-400 dark:hover:text-primary-400 font-display transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
