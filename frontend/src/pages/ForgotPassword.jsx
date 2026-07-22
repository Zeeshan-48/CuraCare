import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { forgotPasswordApi, getErrorMessage } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await forgotPasswordApi(data.email);
      if (response.otp) {
        showToast(`Reset OTP code: ${response.otp}`, 'success');
      } else {
        showToast(response.message, 'success');
      }
      // Redirect to reset password and pass email in state
      navigate('/reset-password', { state: { email: data.email } });
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
            Forgot Password
          </h2>
          <p className="text-sm text-txt-muted mt-2">
            No worries! Enter your email and we'll send you an OTP code to reset it
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

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
              Send Verification OTP
            </Button>
          </form>

          {/* Back to Login */}
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

export default ForgotPassword;
