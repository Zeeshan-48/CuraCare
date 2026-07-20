import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg focus:ring-primary-500 shadow-primary-500/10',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg focus:ring-secondary-500',
    outline: 'border border-dark-200 hover:border-dark-300 text-dark-700 bg-white hover:bg-dark-50 dark:border-dark-700 dark:text-dark-300 dark:bg-dark-900 dark:hover:bg-dark-800 focus:ring-primary-500',
    ghost: 'text-dark-600 hover:text-dark-900 hover:bg-dark-100 dark:text-dark-400 dark:hover:text-white dark:hover:bg-dark-800 focus:ring-primary-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.015 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
