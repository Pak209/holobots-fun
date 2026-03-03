import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * UpdateNotification - Notifies users when a new version is available
 * Appears when service worker detects an update
 * 
 * Note: Only active in production builds with service worker
 */
export function UpdateNotification() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    // Only run in production with service worker support
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker manually
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedRefresh(true);
            }
          });
        });

        // Check if already ready
        if (registration.active && !navigator.serviceWorker.controller) {
          setOfflineReady(true);
        }

        console.log('Service Worker registered');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    // Reload page to activate new service worker
    window.location.reload();
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 border-2 border-white rounded-lg p-4 shadow-xl max-w-sm">
        {offlineReady && (
          <div>
            <p className="text-white font-bold">App ready to work offline</p>
            <Button
              onClick={close}
              size="sm"
              className="mt-2 bg-white text-black hover:bg-gray-100"
            >
              Got it
            </Button>
          </div>
        )}

        {needRefresh && (
          <div>
            <p className="text-white font-bold mb-2">New version available!</p>
            <p className="text-white/90 text-sm mb-3">
              Update now to get the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-white text-black hover:bg-gray-100 font-bold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
              <Button
                onClick={close}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Later
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
