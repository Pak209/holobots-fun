import React from 'react';
import { useDevAccess } from '@/hooks/useDevAccess';

interface DevAccessWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function DevAccessWrapper({ children, fallback = null }: DevAccessWrapperProps) {
  const hasDevAccess = useDevAccess();
  return hasDevAccess ? <>{children}</> : <>{fallback}</>;
}

export function DevOnly({ children }: { children: React.ReactNode }) {
  const hasDevAccess = useDevAccess();
  return hasDevAccess ? <>{children}</> : null;
}

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