
import { BattleScene } from "@/components/BattleScene";
import { NavigationMenu } from "@/components/NavigationMenu";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-retro-background">
      <NavigationMenu />
      <div className="w-full max-w-4xl p-4 md:p-8">
        <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent mb-8">
          HOLOBOTS BATTLE
        </h1>
        <BattleScene />
      </div>
    </div>
  );
};

export default Index;
