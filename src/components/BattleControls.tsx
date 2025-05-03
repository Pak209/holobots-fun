
import { Button } from "./ui/button";
import { Rocket, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HackType } from "@/types/holobot";

interface BattleControlsProps {
  onStartBattle: () => void;
  onHypeUp: () => void;
  onHack: (type: HackType) => void;
  isBattleStarted: boolean;
  hackGauge: number;
  disabled?: boolean; // Add disabled prop to disable all controls if needed
}

export const BattleControls = ({
  onStartBattle,
  onHypeUp,
  onHack,
  isBattleStarted,
  hackGauge,
  disabled = false
}: BattleControlsProps) => {
  // Determine which hack options are available based on the gauge level
  const getHackButtonProps = () => {
    if (hackGauge >= 100) {
      return {
        disabled: !isBattleStarted || disabled,
        className: "h-9 bg-red-500 hover:bg-red-600 text-white border-none text-xs shadow-neon"
      };
    } else if (hackGauge >= 75) {
      return {
        disabled: !isBattleStarted || disabled,
        className: "h-9 bg-orange-500 hover:bg-orange-600 text-white border-none text-xs shadow-neon"
      };
    } else if (hackGauge >= 50) {
      return {
        disabled: !isBattleStarted || disabled, 
        className: "h-9 bg-yellow-500 hover:bg-yellow-600 text-white border-none text-xs shadow-neon"
      };
    } else {
      return {
        disabled: true,
        className: "h-9 bg-gray-500 text-gray-300 border-none text-xs"
      };
    }
  };

  // Get available hack options based on gauge level
  const getAvailableHackOptions = () => {
    const options = [];
    
    if (hackGauge >= 50) {
      options.push(
        <SelectItem key="attack" value="attack">
          Boost Attack (50%)
        </SelectItem>,
        <SelectItem key="speed" value="speed">
          Boost Speed (50%)
        </SelectItem>
      );
    }
    
    if (hackGauge >= 75) {
      options.push(
        <SelectItem key="heal" value="heal">
          Heal (75%)
        </SelectItem>
      );
    }
    
    if (hackGauge >= 100) {
      options.push(
        <SelectItem key="special_attack" value="special_attack">
          Special Attack (100%)
        </SelectItem>
      );
    }
    
    return options;
  };

  const handleHackSelect = (value: string) => {
    if (disabled) return;
    
    if (
      (value === 'attack' || value === 'speed') && hackGauge >= 50 ||
      value === 'heal' && hackGauge >= 75 ||
      value === 'special_attack' && hackGauge >= 100
    ) {
      onHack(value as HackType);
    }
  };

  return (
    <div className="flex gap-1.5">
      <Button 
        className="bg-holobots-accent hover:bg-holobots-hover text-white border-none text-xs shadow-neon-blue animate-pulse"
        size="sm"
        onClick={onStartBattle}
        disabled={disabled}
      >
        {isBattleStarted ? 'End Battle' : 'Start Battle'}
      </Button>
      <Button 
        className="bg-yellow-400 hover:bg-yellow-500 text-white border-none text-xs shadow-neon"
        size="sm"
        onClick={onHypeUp}
        disabled={!isBattleStarted || disabled}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
      </Button>
      <Select 
        onValueChange={handleHackSelect} 
        disabled={hackGauge < 50 || !isBattleStarted || disabled}
      >
        <SelectTrigger {...getHackButtonProps()}>
          <SelectValue>
            <div className="flex items-center">
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" /> 
              <span>Hack ({Math.floor(hackGauge)}%)</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {getAvailableHackOptions()}
        </SelectContent>
      </Select>
    </div>
  );
};
