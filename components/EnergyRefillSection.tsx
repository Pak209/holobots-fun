import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EnergyRefillSectionProps {
  currentEnergy: number;
  maxEnergy: number;
  availableRefills: number;
  onRefill: () => void;
  isRefilling?: boolean;
}

export const EnergyRefillSection: React.FC<EnergyRefillSectionProps> = ({
  currentEnergy,
  maxEnergy,
  availableRefills,
  onRefill,
  isRefilling = false,
}) => {
  const energyPercent = (currentEnergy / maxEnergy) * 100;
  const needsRefill = currentEnergy < maxEnergy;
  const canRefill = availableRefills > 0 && needsRefill;

  return (
    <View className="space-y-2">
      {/* Energy Bar */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-500">Daily Energy</Text>
        <Text className="text-sm font-medium">
          {currentEnergy}/{maxEnergy}
        </Text>
      </View>
      
      <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full"
          style={{ 
            width: `${energyPercent}%`,
            backgroundColor: '#2196f3',
          }} 
        />
      </View>

      {/* Refills Section */}
      <View className="flex-row justify-between items-center mt-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="flash" size={16} color="#f59e0b" />
          <Text className="text-xs text-gray-500">
            Available Refills: {availableRefills}
          </Text>
        </View>

        <Pressable
          className={`
            flex-row items-center gap-1.5 px-3 py-1.5 rounded-full
            ${canRefill ? 'opacity-100' : 'opacity-50'}
          `}
          style={{ backgroundColor: '#2196f315' }}
          disabled={!canRefill || isRefilling}
          onPress={onRefill}
        >
          <Ionicons 
            name={isRefilling ? 'reload' : 'flash'} 
            size={16} 
            color="#2196f3"
          />
          <Text className="text-sm font-medium" style={{ color: '#2196f3' }}>
            {isRefilling ? 'Refilling...' : 'Quick Refill'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}; 