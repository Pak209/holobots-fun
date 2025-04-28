import React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

const toastTypeStyles = {
  success: 'bg-green-100 border-green-500 text-green-900',
  error: 'bg-red-100 border-red-500 text-red-900',
  info: 'bg-blue-100 border-blue-500 text-blue-900',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  onClose,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg max-w-sm',
        toastTypeStyles[type]
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-sm opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 