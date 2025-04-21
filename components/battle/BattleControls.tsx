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
    <div className="flex gap-2">
      <button
        onClick={onStartBattle}
        className="px-4 py-2 bg-holobots-primary text-white rounded-md hover:bg-holobots-primary/80"
      >
        {isBattleStarted ? "End Battle" : "Start Battle"}
      </button>
      
      {isBattleStarted && (
        <>
          <button
            onClick={onHypeUp}
            className="px-4 py-2 bg-holobots-accent text-white rounded-md hover:bg-holobots-accent/80"
          >
            Hype Up
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => hackGauge >= 100 && onHack('attack')}
              className={`px-4 py-2 rounded-md ${
                hackGauge >= 100 
                  ? "bg-holobots-warning text-white hover:bg-holobots-warning/80"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              disabled={hackGauge < 100}
            >
              Hack Attack
            </button>
            <button
              onClick={() => hackGauge >= 100 && onHack('speed')}
              className={`px-4 py-2 rounded-md ${
                hackGauge >= 100 
                  ? "bg-holobots-info text-white hover:bg-holobots-info/80"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              disabled={hackGauge < 100}
            >
              Hack Speed
            </button>
            <button
              onClick={() => hackGauge >= 100 && onHack('heal')}
              className={`px-4 py-2 rounded-md ${
                hackGauge >= 100 
                  ? "bg-holobots-success text-white hover:bg-holobots-success/80"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              disabled={hackGauge < 100}
            >
              Hack Heal
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 