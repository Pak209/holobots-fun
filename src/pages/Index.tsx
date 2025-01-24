import { BattleScene } from "@/components/BattleScene";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-background bg-[url('/lovable-uploads/d4c4d244-e62c-49bc-a241-60ed9a2c303e.png')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-4xl p-8">
        <BattleScene />
      </div>
    </div>
  );
};

export default Index;