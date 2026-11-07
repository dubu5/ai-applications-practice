import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      onClick,
      children,
      className = '',
      autoFocus = false,
    },
    ref
  ) => {
    const baseClass = 'font-semibold rounded-lg transition-all active:scale-95';

    const variantClass = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-400 hover:bg-gray-500 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
    }[variant];

    const sizeClass = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg min-h-[44px] min-w-[44px]',
    }[size];

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
        onClick={onClick}
        disabled={disabled}
        autoFocus={autoFocus}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
