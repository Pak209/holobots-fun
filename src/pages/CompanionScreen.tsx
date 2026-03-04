// ============================================================================
// Companion Screen
// Holobot Companion Mode – persistent emotional layer and default app landing
// ============================================================================

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Zap, Battery, Smile, Swords, Dumbbell, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";

const ELECTRIC_YELLOW = "#F5C400";
const ELECTRIC_CYAN = "#00D4FF";

// Mood state engine: derived from syncToday
function getMoodFromSync(syncToday: number): "Energized" | "Tired" | "Normal" {
  if (syncToday >= 8) return "Energized";
  if (syncToday < 3) return "Tired";
  return "Normal";
}

interface CompanionScreenProps {
  /** When true, render as a section (no full viewport height, less padding) */
  embedded?: boolean;
}

export default function CompanionScreen({ embedded }: CompanionScreenProps) {
  const navigate = useNavigate();

  // Dummy state (will be replaced by Supabase / real data)
  const [syncToday] = useState(6);
  const [syncTodayMax] = useState(10);
  const [energyPercent] = useState(80);
  const [bondLevel] = useState(3);
  const [selectedHolobot] = useState("KUMA"); // could come from user context

  const mood = useMemo(() => getMoodFromSync(syncToday), [syncToday]);
  const syncPercent = useMemo(
    () => Math.min(100, (syncToday / syncTodayMax) * 100),
    [syncToday, syncTodayMax]
  );

  const holobotImage = getHolobotImagePath(selectedHolobot);

  return (
    <div className={embedded ? "flex flex-col items-center py-4 px-4 text-white" : "min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white flex flex-col items-center py-4 px-4 pb-24"}>
      {/* 3 hearts at top */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <Heart
            key={i}
            className="w-7 h-7 fill-red-500 text-red-500"
            strokeWidth={2}
            aria-hidden
          />
        ))}
      </div>

      {/* Holobot name + Bond Level */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-black uppercase tracking-widest text-white">
          {selectedHolobot}
        </h1>
        <span
          className="px-2 py-0.5 text-xs font-bold rounded border-2"
          style={{
            borderColor: ELECTRIC_YELLOW,
            color: ELECTRIC_YELLOW,
            background: "rgba(245,196,0,0.1)",
          }}
        >
          Bond {bondLevel}
        </span>
      </div>

      {/* Center: 96x96 animated sprite */}
      <div className="relative flex items-center justify-center w-28 h-28 my-6">
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${ELECTRIC_CYAN}40 0%, transparent 70%)`,
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
        <img
          src={holobotImage}
          alt={selectedHolobot}
          className="relative w-24 h-24 object-contain animate-companion-idle"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Stats panel */}
      <div
        className="w-full max-w-sm rounded-xl border-2 p-4 space-y-4 mb-6"
        style={{
          background: "rgba(10, 10, 20, 0.7)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(245,196,0,0.4)",
          boxShadow: "0 0 20px rgba(245,196,0,0.1)",
        }}
      >
        {/* Sync Today */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Sync Today
            </span>
            <span className="text-xs font-bold text-white">
              {syncToday}/{syncTodayMax}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-black/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${syncPercent}%`,
                background: `linear-gradient(90deg, ${ELECTRIC_CYAN}, ${ELECTRIC_YELLOW})`,
                boxShadow: `0 0 8px ${ELECTRIC_CYAN}`,
              }}
            />
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
              Energy
            </span>
            <span className="text-xs font-bold text-white">{energyPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-black/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${energyPercent}%`,
                background: `linear-gradient(90deg, ${ELECTRIC_CYAN}, ${ELECTRIC_YELLOW})`,
                boxShadow: `0 0 8px ${ELECTRIC_CYAN}`,
              }}
            />
          </div>
        </div>

        {/* Mood */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-cyan-400" />
            Mood
          </span>
          <span
            className="text-sm font-black uppercase"
            style={{
              color:
                mood === "Energized"
                  ? "#22c55e"
                  : mood === "Tired"
                  ? "#f97316"
                  : ELECTRIC_YELLOW,
            }}
          >
            {mood}
          </span>
        </div>

        {/* Bond Level (display only) */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <span className="text-xs font-bold uppercase text-gray-400">Bond Level</span>
          <span className="text-sm font-black" style={{ color: ELECTRIC_YELLOW }}>
            {bondLevel}
          </span>
        </div>
      </div>

      {/* 3 action buttons: Train, Play, Battle (Evolve removed) */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <Button
          variant="outline"
          className="h-12 border-2 font-bold uppercase tracking-wider text-sm"
          style={{
            borderColor: ELECTRIC_YELLOW,
            color: ELECTRIC_YELLOW,
            background: "rgba(10,10,20,0.6)",
          }}
          onClick={() => navigate(`/sync?tab=training&companion=${encodeURIComponent(selectedHolobot)}`)}
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          Train
        </Button>
        <Button
          variant="outline"
          className="h-12 border-2 font-bold uppercase tracking-wider text-sm"
          style={{
            borderColor: ELECTRIC_YELLOW,
            color: ELECTRIC_YELLOW,
            background: "rgba(10,10,20,0.6)",
          }}
          onClick={() => navigate("/gacha")}
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Play
        </Button>
        <Button
          className="h-12 font-bold uppercase tracking-wider text-sm bg-[#F5C400] hover:bg-[#D4A400] text-black col-span-2"
          style={{ boxShadow: "0 0 16px rgba(245,196,0,0.4)" }}
          onClick={() => navigate(`/app/battle?mode=arena-v2&companion=${encodeURIComponent(selectedHolobot)}`)}
        >
          <Swords className="w-4 h-4 mr-2" />
          Battle
        </Button>
      </div>

      {/* Keyframes for idle animation and glow */}
      <style>{`
        @keyframes companion-idle {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-2px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-companion-idle {
          animation: companion-idle 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
