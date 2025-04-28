import React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'default', isLoading, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    const variantStyles = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
      outline: "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100",
      link: "text-blue-600 hover:underline dark:text-blue-400"
    };
    
    const sizeStyles = {
      default: "h-10 py-2 px-4",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10"
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isLoading && "opacity-70",
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
); 