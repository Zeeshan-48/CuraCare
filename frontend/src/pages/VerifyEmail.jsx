import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { authSuccess } from '../features/auth/authSlice.js';
import { verifyOtpApi, resendOtpApi, getErrorMessage } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const verifyEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  code: z.string().length(6, 'OTP code must be exactly 6 digits'),
});

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Retrieve email passed in router state
  const passedEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: passedEmail,
      code: '',
    },
  });

  const emailValue = watch('email');

  // Cooldown Timer Effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isNaN(Number(data.code))) {
        throw new Error('OTP code must be numeric.');
      }

      const response = await verifyOtpApi(data.email, data.code);
      showToast('Email verified successfully! Welcome to CuraCare.', 'success');
      
      // Auto-log the user in upon verification success
      dispatch(authSuccess(response));
      navigate('/');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailValue) {
      showToast('Please enter an email address first.', 'error');
      return;
    }

    setIsResending(true);
    try {
      await resendOtpApi(emailValue);
      showToast('A new verification code has been sent to your email.', 'success');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsResending(false);
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
            Verify Your Email
          </h2>
          <p className="text-sm text-txt-muted mt-2">
            Please enter the 6-digit OTP code sent to your email address to activate your account.
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
              readOnly={!!passedEmail}
              {...register('email')}
            />

            <Input
              label="Verification Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              error={errors.code?.message}
              {...register('code')}
            />

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
              Verify and Activate Account
            </Button>
          </form>

          {/* Resend Code Section */}
          <div className="mt-6 text-center text-xs text-txt-muted flex items-center justify-center gap-2">
            <span>Didn't receive the code?</span>
            {resendCooldown > 0 ? (
              <span className="font-semibold text-primary-500">Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold text-primary-500 hover:text-primary-650 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
                Resend Code
              </button>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-bdr-light text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 font-semibold text-sm text-dark-500 hover:text-primary-500 dark:text-dark-400 dark:hover:text-primary-400 font-display transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
