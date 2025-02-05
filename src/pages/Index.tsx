
import { BattleScene } from "@/components/BattleScene";
import { NavigationMenu } from "@/components/NavigationMenu";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="text-2xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
      </nav>
      <NavigationMenu />
      <div className="w-full max-w-4xl p-4 md:p-8">
        <BattleScene />
      </div>
    </div>
  );
};

export default Index;
