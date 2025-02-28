
import { QuestGrid } from "@/components/QuestGrid";

const Quests = () => {
  return (
    <div className="px-3 py-4">
      <h1 className="text-center text-2xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent mb-4">
        HOLOBOT QUESTS
      </h1>
      <QuestGrid />
    </div>
  );
};

export default Quests;
