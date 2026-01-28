import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Zap, Heart } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  holobotName: string;
  currentLevel: number;
  availablePoints: number;
  currentBoosts: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  onUpgrade: (stat: 'attack' | 'defense' | 'speed' | 'health') => Promise<void>;
  onClose: () => void;
}

export function LevelUpModal({
  isOpen,
  holobotName,
  currentLevel,
  availablePoints,
  currentBoosts,
  onUpgrade,
  onClose
}: LevelUpModalProps) {
  const [selectedStat, setSelectedStat] = useState<'attack' | 'defense' | 'speed' | 'health' | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const stats = [
    {
      key: 'attack' as const,
      name: 'Attack',
      icon: Sword,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      description: '+1 Attack Power',
      current: currentBoosts.attack || 0
    },
    {
      key: 'defense' as const,
      name: 'Defense',
      icon: Shield,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500',
      description: '+1 Defense',
      current: currentBoosts.defense || 0
    },
    {
      key: 'speed' as const,
      name: 'Speed',
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      description: '+1 Speed',
      current: currentBoosts.speed || 0
    },
    {
      key: 'health' as const,
      name: 'HP',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500',
      description: '+1 Max HP',
      current: currentBoosts.health || 0
    }
  ];

  const handleUpgrade = async () => {
    if (!selectedStat || availablePoints <= 0) return;
    
    setIsUpgrading(true);
    try {
      await onUpgrade(selectedStat);
      setSelectedStat(null);
      
      // Close modal if no more points
      if (availablePoints === 1) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to upgrade stat:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-2 border-cyan-500 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-cyan-400">
            🎉 {holobotName} Level Up!
          </DialogTitle>
          <div className="text-center space-y-2 pt-4">
            <div className="text-6xl font-bold text-yellow-400">
              Level {currentLevel}
            </div>
            <div className="text-lg text-gray-300">
              Choose a stat to upgrade
            </div>
            <div className="text-sm text-cyan-400">
              Available Points: <span className="font-bold text-2xl">{availablePoints}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isSelected = selectedStat === stat.key;
            
            return (
              <button
                key={stat.key}
                onClick={() => setSelectedStat(stat.key)}
                className={`
                  relative p-6 rounded-lg border-2 transition-all duration-200
                  ${stat.bgColor}
                  ${isSelected 
                    ? `${stat.borderColor} scale-105 shadow-lg` 
                    : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center space-y-3">
                  <Icon className={`w-12 h-12 ${stat.color}`} />
                  <div className="text-xl font-bold text-white">{stat.name}</div>
                  <div className="text-sm text-gray-400">{stat.description}</div>
                  <div className="text-xs text-gray-500">
                    Current Boost: +{stat.current}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isUpgrading}
          >
            {availablePoints > 0 ? 'Save for Later' : 'Close'}
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!selectedStat || isUpgrading || availablePoints <= 0}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
          >
            {isUpgrading ? 'Upgrading...' : 'Upgrade Selected Stat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
