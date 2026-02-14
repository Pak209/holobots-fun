import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Fitness from "./Fitness";
import Quests from "./Quests";
import Training from "./Training";
import { Activity, Trophy, Sword } from "lucide-react";

/**
 * Sync page - consolidates Fitness, Quests, and Training into tabbed interface
 * This serves as the main hub for all Holobot progression activities
 */
const Sync = () => {
  const [activeTab, setActiveTab] = useState<string>("fitness");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sci-Fi HUD Header */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-b-4 border-black" style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      }}>
        <h1 className="text-base sm:text-xl md:text-2xl font-black text-black uppercase tracking-widest text-center">
          SYNC STATION
        </h1>
      </div>

      <div className="px-4 pt-4 pb-16">
        {/* Arena-style Tab Selector */}
        <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-4 border-[#F5C400] mb-6 p-1 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
        }}>
          <div className="grid grid-cols-3 gap-1 relative">
            {/* Sliding background indicator */}
            <div
              className="absolute h-full bg-[#F5C400] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(245,196,0,0.6)]"
              style={{
                left: activeTab === "fitness" ? "0%" : activeTab === "quests" ? "33.333%" : "66.666%",
                width: "33.333%",
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            />

            {/* Fitness Button */}
            <button
              onClick={() => setActiveTab("fitness")}
              className={`relative z-10 py-3 px-4 font-black uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "fitness" ? "text-black" : "text-[#F5C400] hover:text-white"
              }`}
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Sync Training</span>
              <span className="sm:hidden">Fitness</span>
            </button>

            {/* Quests Button */}
            <button
              onClick={() => setActiveTab("quests")}
              className={`relative z-10 py-3 px-4 font-black uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "quests" ? "text-black" : "text-[#F5C400] hover:text-white"
              }`}
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            >
              <Trophy className="h-4 w-4" />
              <span>Quests</span>
            </button>

            {/* Training Button */}
            <button
              onClick={() => setActiveTab("training")}
              className={`relative z-10 py-3 px-4 font-black uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "training" ? "text-black" : "text-[#F5C400] hover:text-white"
              }`}
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            >
              <Sword className="h-4 w-4" />
              <span>Training</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black">
          {activeTab === "fitness" && <Fitness />}
          {activeTab === "quests" && <Quests />}
          {activeTab === "training" && <Training />}
        </div>
      </div>
    </div>
  );
};

export default Sync;
