import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Plus, HardHat, Shield, Zap, Activity, Cpu } from 'lucide-react';
import { useHolobotPartsStore } from '../stores/holobotPartsStore';
import { PartCard } from '../components/holobots/PartCard';
import { Part, PartSlot, PART_SLOTS } from '../types/holobotParts';
import { cn } from '../lib/utils';
import { Button } from '@/components/ui/button';

interface HolobotPartsScreenProps {
  holobotId: string;
}

export const HolobotPartsScreen: React.FC<HolobotPartsScreenProps> = ({
  holobotId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [selectedSlot, setSelectedSlot] = useState<PartSlot>('head');
  const [showInventory, setShowInventory] = useState(false);
  
  const {
    getEquippedParts,
    getInventoryBySlot,
    equipPart,
    unequipPart,
  } = useHolobotPartsStore();
  
  const equippedParts = getEquippedParts(holobotId);
  const inventoryParts = getInventoryBySlot(selectedSlot);
  
  const handleEquipPart = (part: Part) => {
    equipPart(holobotId, part);
    setShowInventory(false);
  };
  
  const handleUnequipPart = (slot: PartSlot) => {
    unequipPart(holobotId, slot);
  };
  
  const getSlotIcon = (slot: PartSlot) => {
    switch (slot) {
      case 'head':
        return <HardHat className="w-4 h-4" />;
      case 'torso':
        return <Shield className="w-4 h-4" />;
      case 'arms':
        return <Activity className="w-4 h-4" />;
      case 'legs':
        return <Activity className="w-4 h-4" />;
      case 'core':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };
  
  const renderSlotSelector = () => (
    <div className="flex overflow-x-auto px-4 py-2 space-x-2">
      {PART_SLOTS.map((slot) => (
        <button
          key={slot}
          onClick={() => setSelectedSlot(slot)}
          className={cn(
            'px-4 py-2 rounded-full whitespace-nowrap',
            'flex items-center space-x-2 transition-colors',
            selectedSlot === slot
              ? isDark
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-900'
              : isDark
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {getSlotIcon(slot)}
          <span className="font-medium capitalize">
            {slot}
          </span>
        </button>
      ))}
    </div>
  );
  
  const renderEquippedPart = () => {
    const part = equippedParts[selectedSlot];
    
    if (!part) {
      return (
        <div
          className={cn(
            'flex-1 flex flex-col items-center justify-center p-8 m-4 rounded-lg',
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          )}
        >
          <Plus className="w-12 h-12 mb-4 text-gray-400" />
          <h3 className={cn(
            'text-lg font-medium mb-2',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            No {selectedSlot} equipped
          </h3>
          <Button
            onClick={() => setShowInventory(true)}
            variant="outline"
            className="mt-4"
          >
            Equip {selectedSlot}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <PartCard
            part={part}
            size="lg"
            onPress={() => handleUnequipPart(selectedSlot)}
          />
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => setShowInventory(true)}
            variant="outline"
          >
            Change {selectedSlot}
          </Button>
        </div>
      </div>
    );
  };
  
  const renderInventory = () => {
    if (!showInventory) return null;
    
    return (
      <div
        className={cn(
          'fixed inset-0 z-50',
          isDark ? 'bg-gray-900' : 'bg-white'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className={cn(
              'text-xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Inventory
            </h2>
            <button
              onClick={() => setShowInventory(false)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {inventoryParts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inventoryParts.map((part) => (
                  <PartCard
                    key={part.id}
                    part={part}
                    size="sm"
                    onPress={() => handleEquipPart(part)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mb-4" />
                <p className={cn(
                  'text-lg',
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>
                  No {selectedSlot} parts in inventory
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div
      className={cn(
        'min-h-screen',
        isDark ? 'bg-gray-900' : 'bg-white'
      )}
    >
      {renderSlotSelector()}
      {renderEquippedPart()}
      {renderInventory()}
    </div>
  );
}; 