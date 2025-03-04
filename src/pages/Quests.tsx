
import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/AuthContext";

const Quests = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            HOLOBOT QUESTS
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Send your Holobots on adventures to earn rewards and level up
          </p>
        </div>
        
        <QuestGrid />
      </div>
    </div>
  );
};

export default Quests;
