
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BattleControlsProps {
  onStartBattle: () => void;
  onHypeUp: () => void;
  onHack: (type: 'attack' | 'speed' | 'heal') => void;
  isBattleStarted: boolean;
  hackGauge: number;
}

export const BattleControls = ({ 
  onStartBattle, 
  onHypeUp,
  onHack,
  isBattleStarted,
  hackGauge
}: BattleControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 md:flex-row">
      <Button
        onClick={onStartBattle}
        className={`${
          isBattleStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        {isBattleStarted ? 'Reset Battle' : 'Start Battle'}
      </Button>

      <Button
        onClick={onHypeUp}
        disabled={!isBattleStarted}
        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
      >
        Hype Up!
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select
              disabled={!isBattleStarted || hackGauge < 100}
              onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal')}
            >
              <SelectTrigger className={`w-24 ${
                hackGauge >= 100 
                  ? 'bg-purple-600 text-white border-purple-400' 
                  : 'bg-gray-700 text-gray-400 border-gray-600'
              }`}>
                Hack {hackGauge >= 100 ? '✓' : `${Math.floor(hackGauge)}%`}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attack">Attack +</SelectItem>
                <SelectItem value="speed">Speed +</SelectItem>
                <SelectItem value="heal">Heal</SelectItem>
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Hack abilities unlock at 100%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
