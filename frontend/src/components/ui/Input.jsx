import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      rightIcon: RightIcon,
      onRightIconClick,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full text-left mb-4">
        {label && (
          <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <input
            ref={ref}
            type={type}
            className={`form-input ${
              RightIcon ? 'pr-10' : ''
            } ${
              error
                ? 'border-red-500 focus:ring-red-200'
                : ''
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-txt-muted hover:text-txt-main ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <RightIcon size={18} />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
