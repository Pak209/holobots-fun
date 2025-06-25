import React, { useEffect } from 'react';
import { ElementalType, ELEMENTAL_EFFECTS } from '../../types/holobotParts';
import { Flame, Snowflake, Bolt, Brain, Wind, Mountain } from 'lucide-react';

interface SpecialAttackEffectProps {
  elementType: ElementalType;
  duration?: number;
  onComplete?: () => void;
}

const ELEMENTAL_COLORS: Record<ElementalType, string> = {
  fire: '#ef4444',
  ice: '#3b82f6',
  electric: '#f59e0b',
  psychic: '#8b5cf6',
  wind: '#10b981',
  earth: '#a17c3a',
};

const ELEMENTAL_ICONS: Record<ElementalType, React.ReactNode> = {
  fire: <Flame className="w-8 h-8 text-white" />,
  ice: <Snowflake className="w-8 h-8 text-white" />,
  electric: <Bolt className="w-8 h-8 text-white" />,
  psychic: <Brain className="w-8 h-8 text-white" />,
  wind: <Wind className="w-8 h-8 text-white" />,
  earth: <Mountain className="w-8 h-8 text-white" />,
};

export const SpecialAttackEffect: React.FC<SpecialAttackEffectProps> = ({
  elementType,
  duration = 2000,
  onComplete,
}) => {
  useEffect(() => {
    // Trigger completion callback
    const timeout = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onComplete]);

  const effect = ELEMENTAL_EFFECTS[elementType];
  const color = ELEMENTAL_COLORS[elementType];
  const icon = ELEMENTAL_ICONS[elementType];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-pulse"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      
      {/* Particle effects based on element type */}
      {elementType === 'fire' && (
        <div className="absolute inset-0 flex items-center justify-center animate-spin">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: color,
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
              }}
            />
          ))}
        </div>
      )}
      
      {elementType === 'ice' && (
        <div className="absolute inset-0 flex items-center justify-center animate-spin">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 border-2 border-solid transform rotate-45"
              style={{
                borderColor: color,
                transform: `rotate(${i * 60}deg) translateY(-15px) rotate(45deg)`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Add more element-specific effects as needed */}
    </div>
  );
}; 