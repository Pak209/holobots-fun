
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { PlayerSearch } from "@/components/battle/PlayerSearch";
import { MobileLayout } from "@/components/MobileLayout"; 

const PvPBattle = () => {
  const defaultLeftHolobot = 'ace';
  const defaultRightHolobot = 'kuma';

  return (
    <MobileLayout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BattleScene 
            leftHolobot={defaultLeftHolobot}
            rightHolobot={defaultRightHolobot}
          />
          <PlayerSearch />
        </div>
      </div>
    </MobileLayout>
  );
};

export default PvPBattle;
