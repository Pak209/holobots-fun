import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useDevModeStore } from '@/stores/devModeStore';
import { useDevAccessInfo } from '@/hooks/useDevAccess';
import { Settings } from 'lucide-react';

export function DevModeToggle() {
  const { isDevModeEnabled, toggleDevMode } = useDevModeStore();
  const { isDevAccount } = useDevAccessInfo();

  // Only show if user is a dev account
  if (!isDevAccount) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg border border-cyan-500/30">
      <Settings className="w-4 h-4 text-cyan-400" />
      <span className="text-xs text-cyan-300">Dev Mode</span>
      <Switch
        checked={isDevModeEnabled}
        onCheckedChange={toggleDevMode}
        className="scale-75"
      />
      {isDevModeEnabled && (
        <Badge className="bg-cyan-500 text-black text-xs px-1 py-0 h-4">
          ON
        </Badge>
      )}
    </div>
  );
} 