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
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${leftHealth}%` }}
          />
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 transition-all duration-300"
            style={{ width: `${leftSpecial}%` }}
          />
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${leftHack}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${rightHealth}%` }}
          />
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 transition-all duration-300"
            style={{ width: `${rightSpecial}%` }}
          />
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${rightHack}%` }}
          />
        </div>
      </div>
    </div>
  );
}; 