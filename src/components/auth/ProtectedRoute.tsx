
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  redirectPath = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // Give auth system a small grace period to initialize
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isVerifying || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-holobots-background dark:bg-holobots-dark-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-holobots-accent mb-4" />
          <p className="text-lg font-medium">Authenticating...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 max-w-md mx-auto bg-black/50 p-4 rounded-md text-left text-xs font-mono overflow-auto">
              <p className="text-green-400">Debug Info:</p>
              <p>Loading: {loading ? 'true' : 'false'}</p>
              <p>Auth Error: {error || 'none'}</p>
              <p>Verifying: {isVerifying ? 'true' : 'false'}</p>
              <p>Path: {location.pathname}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-holobots-background dark:bg-holobots-dark-background">
        <div className="text-center max-w-md mx-auto p-6 bg-holobots-card dark:bg-holobots-dark-card rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-500">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = redirectPath}
            className="px-4 py-2 bg-holobots-accent text-white rounded-md hover:bg-holobots-accent/80 transition-colors"
          >
            Return to Login
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 bg-black/50 p-4 rounded-md text-left text-xs font-mono overflow-auto">
              <p className="text-yellow-400">Debug Info:</p>
              <p>Error: {error}</p>
              <p>Path: {location.pathname}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they tried to access
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
