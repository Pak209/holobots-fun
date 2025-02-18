
import { StatusBar } from "../HealthBar";

interface BattleMetersProps {
  leftHealth: number;
  rightHealth: number;
  leftSpecial: number;
  rightSpecial: number;
  leftHack: number;
  rightHack: number;
}

export const BattleMeters = ({
  leftHealth,
  rightHealth,
  leftSpecial,
  rightSpecial,
  leftHack,
  rightHack
}: BattleMetersProps) => {
  return (
    <div className="space-y-0.5 md:space-y-1">
      <div className="flex justify-between items-center gap-2 md:gap-4">
        <div className="flex-1 space-y-0.5 md:space-y-1">
          <StatusBar current={leftHealth} max={100} isLeft={true} type="health" />
          <StatusBar current={leftSpecial} max={100} isLeft={true} type="special" />
          <StatusBar current={leftHack} max={100} isLeft={true} type="hack" />
        </div>
        <div className="px-2 py-1 bg-black/50 rounded-lg animate-vs-pulse">
          <span className="text-white font-bold text-xs md:text-sm">VS</span>
        </div>
        <div className="flex-1 space-y-0.5 md:space-y-1">
          <StatusBar current={rightHealth} max={100} isLeft={false} type="health" />
          <StatusBar current={rightSpecial} max={100} isLeft={false} type="special" />
          <StatusBar current={rightHack} max={100} isLeft={false} type="hack" />
        </div>
      </div>
    </div>
  );
};
