
import { Button } from "./ui/button";
import { Rocket, Zap, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface BattleControlsProps {
  onStartBattle: () => void;
  onHypeUp: () => void;
  onHack: (type: 'attack' | 'speed' | 'heal' | 'defense' | 'special') => void;
  onPayToHack: () => void;
  isBattleStarted: boolean;
  hackGauge: number;
  userTokens?: number;
}

export const BattleControls = ({
  onStartBattle,
  onHypeUp,
  onHack,
  onPayToHack,
  isBattleStarted,
  hackGauge,
  userTokens = 0
}: BattleControlsProps) => {
  // Determine if the hack is usable based on different percentage thresholds
  const isHackUsable = hackGauge >= 50;
  const hackType = hackGauge < 75 ? 'boost' : hackGauge < 100 ? 'heal' : 'special';
  const canPayForHack = userTokens >= 100;

  return (
    <div className="flex gap-1.5">
      <Button 
        variant="outline"
        className="bg-holobots-accent hover:bg-holobots-hover text-white border-none text-xs shadow-neon-blue animate-pulse"
        size="sm"
        onClick={onStartBattle}
      >
        {isBattleStarted ? 'End Battle' : 'Start Battle'}
      </Button>
      <Button 
        variant="outline"
        className="bg-yellow-400 hover:bg-yellow-500 text-white border-none text-xs shadow-neon"
        size="sm"
        onClick={onHypeUp}
        disabled={!isBattleStarted}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
      </Button>
      <Select onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal' | 'defense' | 'special')} disabled={!isHackUsable || !isBattleStarted}>
        <SelectTrigger 
          className={`h-9 ${!isHackUsable ? 'bg-red-500 opacity-70' : 'bg-red-500'} hover:bg-red-600 text-white border-none text-xs shadow-neon`}
        >
          <Zap className="w-3 h-3 md:w-4 md:h-4" /> 
          Hack ({Math.floor(hackGauge)}%) {hackType === 'boost' ? 'Boost' : hackType === 'heal' ? 'Heal' : 'Special'}
        </SelectTrigger>
        <SelectContent className="bg-holobots-card border-holobots-border">
          <SelectItem value="attack" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Boost Attack</SelectItem>
          <SelectItem value="speed" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Boost Speed</SelectItem>
          <SelectItem value="defense" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Boost Defense</SelectItem>
          <SelectItem value="heal" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Heal</SelectItem>
          <SelectItem value="special" className="text-holobots-text hover:bg-holobots-accent hover:text-white" disabled={hackGauge < 100}>Special Attack</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        className="bg-green-500 hover:bg-green-600 text-white border-none text-xs shadow-neon"
        size="sm"
        onClick={onPayToHack}
        disabled={!canPayForHack || !isBattleStarted || hackGauge >= 100}
      >
        <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> Pay 100 HOLOS
      </Button>
    </div>
  );
};
