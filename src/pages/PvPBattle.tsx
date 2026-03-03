import { useState } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { PvPPrebattleMenu } from "@/components/battle/PvPPrebattleMenu";

const PvPBattle = () => {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const defaultRightHolobot = 'kuma';

  const handleStartMatch = (holobot: string) => {
    setSelectedHolobot(holobot);
    setIsBattleStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16 pb-20">
        <div className="text-center mb-8">
          <div className="relative mb-6 inline-block">
            <div className="bg-gradient-to-r from-[#F5C400] via-[#F5C400] to-transparent p-4 pr-24 border-4 border-[#F5C400] shadow-[0_0_30px_rgba(245,196,0,0.6)]" style={{
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'
            }}>
              <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest">PVP BATTLE</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-md mx-auto uppercase tracking-wide">
            Challenge other players in real-time battles
          </p>
        </div>

        {!isBattleStarted ? (
          <div className="max-w-2xl mx-auto">
            <PvPPrebattleMenu onStartMatch={handleStartMatch} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <BattleScene 
              leftHolobot={selectedHolobot || 'ace'}
              rightHolobot={defaultRightHolobot}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PvPBattle;
