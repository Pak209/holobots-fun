
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { PlayerSearch } from "@/components/battle/PlayerSearch";

const PvPBattle = () => {
  const defaultLeftHolobot = 'ace';
  const defaultRightHolobot = 'kuma';

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BattleScene 
            leftHolobot={defaultLeftHolobot}
            rightHolobot={defaultRightHolobot}
          />
          <PlayerSearch />
        </div>
      </div>
    </div>
  );
};

export default PvPBattle;
