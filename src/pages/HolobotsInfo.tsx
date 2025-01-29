import { NavigationMenu } from "@/components/NavigationMenu";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";

const HolobotsInfo = () => {
  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text p-4">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          HOLOBOTS INFO
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.values(HOLOBOT_STATS).map((holobot) => (
            <div key={holobot.name} className="flex flex-col md:flex-row gap-4 bg-holobots-card dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon">
              {/* Stats Panel */}
              <div className="flex-1 bg-black/30 p-4 rounded-lg border border-holobots-accent">
                <h2 className="text-xl font-bold mb-4 text-holobots-accent">
                  {holobot.name}
                </h2>
                <div className="space-y-2 font-mono">
                  <p>HP: {holobot.maxHealth}</p>
                  <p>Attack: {holobot.attack}</p>
                  <p>Defense: {holobot.defense}</p>
                  <p>Speed: {holobot.speed}</p>
                  <p>Level: {holobot.level}</p>
                  <p className="text-holobots-accent">Special: {holobot.specialMove}</p>
                </div>
                
                {/* Attribute Boost Section */}
                <div className="mt-4 pt-4 border-t border-holobots-border dark:border-holobots-dark-border">
                  <h3 className="text-sm font-bold mb-2 text-holobots-accent">
                    Available Boosts
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                      +1 ATK
                    </button>
                    <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                      +1 DEF
                    </button>
                    <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                      +1 SPD
                    </button>
                    <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                      +10 HP
                    </button>
                  </div>
                </div>
              </div>
              
              {/* TCG Card */}
              <div className="flex-1 flex justify-center items-start">
                <HolobotCard stats={holobot} variant="blue" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HolobotsInfo;