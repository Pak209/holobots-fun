import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Date.now();
    const newToast = {
      ...options,
      duration: options.duration || 3000,
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast !== newToast));
    }, newToast.duration);
  };

  return { toast, toasts };
}; 