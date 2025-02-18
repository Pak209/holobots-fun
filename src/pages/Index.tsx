
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { HOLOBOT_STATS } from "@/types/holobot";

const Index = () => {
  // Default to 'ace' and 'kuma' as initial holobots
  const defaultLeftHolobot = 'ace';
  const defaultRightHolobot = 'kuma';

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16">
        <BattleScene 
          leftHolobot={defaultLeftHolobot}
          rightHolobot={defaultRightHolobot}
        />
      </div>
    </div>
  );
};

export default Index;
