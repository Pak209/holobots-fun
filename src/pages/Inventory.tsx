import { useState } from "react";
import { Package, Database, FileText } from "lucide-react";
import HolobotsInfo from "./HolobotsInfo";
import UserItems from "./UserItems";
import Blueprints from "./Blueprints";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Inventory page - consolidates Holobots Info, Blueprints, and User Items into tabbed interface
 * This serves as the main hub for viewing your Holobots collection, blueprints, and items
 */
const Inventory = () => {
  const [activeTab, setActiveTab] = useState<string>("holobots");

  return (
    <div className="min-h-screen text-gray-900">
      <div className="container mx-auto px-4 pb-24 pt-20">
        {/* Arena-Style Tab Selector */}
        <div className="px-4 py-4 relative z-10 mb-6">
          <div className="flex items-center justify-center">
            <div className="relative bg-black/60 rounded-lg p-1 border border-cyan-500/30">
              <div
                className={cn(
                  "absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out",
                  "bg-gradient-to-r shadow-lg",
                  activeTab === 'holobots'
                    ? "left-1 w-1/3 from-yellow-500/40 to-orange-600/40 border border-yellow-400/50"
                    : activeTab === 'blueprints'
                    ? "left-1/3 w-1/3 from-cyan-500/40 to-cyan-600/40 border border-cyan-400/50"
                    : "left-2/3 right-1 from-purple-500/40 to-fuchsia-600/40 border border-purple-400/50"
                )}
              />
              <div className="relative flex gap-3">
                <button
                  onClick={() => setActiveTab('holobots')}
                  className={cn(
                    "px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 relative z-10 uppercase",
                    "flex items-center justify-center gap-3",
                    "border-4 clip-path-diagonal",
                    activeTab === 'holobots'
                      ? "bg-[#F5C400] border-[#F5C400] text-black shadow-[0_0_20px_rgba(245,196,0,0.6)]"
                      : "bg-black/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  )}
                  style={{
                    clipPath: activeTab === 'holobots'
                      ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                      : 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <Database className="h-5 w-5" />
                  HOLOBOTS
                </button>
                <button
                  onClick={() => setActiveTab('blueprints')}
                  className={cn(
                    "px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 relative z-10 uppercase",
                    "flex items-center justify-center gap-3",
                    "border-4 clip-path-diagonal",
                    activeTab === 'blueprints'
                      ? "bg-[#F5C400] border-[#F5C400] text-black shadow-[0_0_20px_rgba(245,196,0,0.6)]"
                      : "bg-black/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  )}
                  style={{
                    clipPath: activeTab === 'blueprints'
                      ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                      : 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <FileText className="h-5 w-5" />
                  BLUEPRINTS
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={cn(
                    "px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 relative z-10 uppercase",
                    "flex items-center justify-center gap-3",
                    "border-4 clip-path-diagonal",
                    activeTab === 'items'
                      ? "bg-[#F5C400] border-[#F5C400] text-black shadow-[0_0_20px_rgba(245,196,0,0.6)]"
                      : "bg-black/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  )}
                  style={{
                    clipPath: activeTab === 'items'
                      ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                      : 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <Package className="h-5 w-5" />
                  ITEMS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative z-0">
          {activeTab === 'holobots' && <HolobotsInfo />}
          {activeTab === 'blueprints' && <Blueprints />}
          {activeTab === 'items' && <UserItems />}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
