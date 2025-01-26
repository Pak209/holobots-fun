import { NavigationMenu } from "@/components/NavigationMenu";
import { QuestGrid } from "@/components/QuestGrid";

const Quests = () => {
  return (
    <div className="min-h-screen bg-retro-background text-white">
      <NavigationMenu />
      <div className="container mx-auto p-4">
        <h1 className="text-center text-4xl font-bold text-retro-accent my-8">HOLOBOT QUESTS</h1>
        <QuestGrid />
      </div>
    </div>
  );
};

export default Quests;