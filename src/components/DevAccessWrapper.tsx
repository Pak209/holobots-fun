import React from 'react';
import { useDevAccess } from '@/hooks/useDevAccess';

interface DevAccessWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDevBadge?: boolean;
}

/**
 * Wrapper component that conditionally renders content based on dev access
 * @param children - Content to show if user has dev access
 * @param fallback - Content to show if user doesn't have dev access (optional)
 * @param showDevBadge - Deprecated: Dev mode toggle is now in the header
 */
export function DevAccessWrapper({ 
  children, 
  fallback = null, 
  showDevBadge = true 
}: DevAccessWrapperProps) {
  const hasDevAccess = useDevAccess();

  if (!hasDevAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Simple conditional wrapper without any UI decorations
 */
export function DevOnly({ children }: { children: React.ReactNode }) {
  const hasDevAccess = useDevAccess();
  
  return hasDevAccess ? <>{children}</> : null;
}

/**
 * Component that shows different content for dev vs normal users
 */
export function DevSwitcher({ 
  devContent, 
  normalContent 
}: { 
  devContent: React.ReactNode; 
  normalContent: React.ReactNode; 
}) {
  const hasDevAccess = useDevAccess();
  
  return <>{hasDevAccess ? devContent : normalContent}</>;
} 