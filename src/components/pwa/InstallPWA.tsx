import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * InstallPWA - Prompts users to install the PWA
 * Shows on mobile and desktop browsers that support PWA installation
 */
export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds (don't be too aggressive)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      // Show again after 7 days
      if (now.getTime() - dismissedDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS install instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-4 border-black rounded-lg p-4 shadow-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-black hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-3">
            <Smartphone className="h-6 w-6 text-black mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-black text-black uppercase mb-2">Install Holobots App</h3>
              <p className="text-sm text-black/90 mb-2">
                Install Holobots for a better experience:
              </p>
              <ol className="text-xs text-black/80 space-y-1 list-decimal list-inside">
                <li>Tap the Share button <span className="inline-block">□↑</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt
  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-4 border-black rounded-lg p-4 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-black hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start gap-3 mb-3">
          <Download className="h-6 w-6 text-black mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-black text-black uppercase">Install Holobots</h3>
            <p className="text-sm text-black/80 mt-1">
              Get the full experience with offline battles and faster loading
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-black text-[#F5C400] hover:bg-black/90 font-bold uppercase"
          >
            Install Now
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="border-black text-black hover:bg-black/10"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}
