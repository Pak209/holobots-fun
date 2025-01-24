import { BattleScene } from "@/components/BattleScene";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-background">
      <div className="w-full max-w-4xl p-4 md:p-8">
        <BattleScene />
      </div>
    </div>
  );
};

export default Index;