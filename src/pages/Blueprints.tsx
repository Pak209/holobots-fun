import { HOLOBOT_STATS } from "@/types/holobot";
import { BlueprintSection } from "@/components/holobots/BlueprintSection";

const Blueprints = () => {
  return (
    <>
      {/* Header with sci-fi HUD style */}
      <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] p-3 mb-6 border-b-4 border-black" style={{
        clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)'
      }}>
        <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-widest text-center">
          Blueprints
        </h1>
      </div>
      
      {/* Blueprint Sections */}
      <div className="grid grid-cols-1 gap-6 px-4">
        {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => (
          <BlueprintSection 
            key={key}
            holobotKey={key}
            holobotName={holobot.name}
          />
        ))}
      </div>
    </>
  );
};

export default Blueprints;
