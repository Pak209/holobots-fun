import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Quests from "./Quests";
import Training from "./Training";
import { Trophy, Sword, Smartphone } from "lucide-react";

/**
 * Sync page - consolidates Quests and Training
 * Note: Fitness tracking moved to Mobile App for automatic step tracking
 */
const Sync = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const companionParam = searchParams.get("companion");
  const [activeTab, setActiveTab] = useState<string>(() =>
    tabParam === "training" ? "training" : "quests"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
      {/* Sci-Fi HUD Header */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-b-4 border-black" style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      }}>
        <h1 className="text-base sm:text-xl md:text-2xl font-black text-black uppercase tracking-widest text-center">
          SYNC STATION
        </h1>
      </div>

      <div className="px-4 pt-4 pb-20">
        {/* Mobile App Notice */}
        <div className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-bold text-blue-400">Fitness Tracking Moved to Mobile App</p>
              <p className="text-xs text-gray-400">
                Download the Holobots mobile app for automatic step tracking from HealthKit/Google Fit
              </p>
            </div>
          </div>
        </div>

        {/* Arena-style Tab Selector */}
        <div className="relative bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border-4 border-[#F5C400] mb-6 p-1 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
        }}>
          <div className="grid grid-cols-2 gap-1 relative">
            {/* Sliding background indicator */}
            <div
              className="absolute h-full bg-[#F5C400] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(245,196,0,0.6)]"
              style={{
                left: activeTab === "quests" ? "0%" : "50%",
                width: "50%",
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            />

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
        <div>
          {activeTab === "quests" && <Quests />}
          {activeTab === "training" && <Training initialCompanionName={companionParam ?? undefined} />}
        </div>
      </div>
    </div>
  );
};

export default Sync;
