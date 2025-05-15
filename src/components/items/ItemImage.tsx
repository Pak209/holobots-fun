import { cva, type VariantProps } from "class-variance-authority";
import { Zap, Trophy, Ticket, FastForward, Coins, Activity, Puzzle, BarChart2, RefreshCcw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const itemImageVariants = cva(
  "relative flex flex-col items-center justify-center rounded-lg overflow-hidden transition-all duration-300",
  {
    variants: {
      type: {
        "arena-pass": "bg-gradient-to-br from-purple-900/60 via-purple-700/40 to-purple-950/90 border border-purple-500",
        "gacha-ticket": "bg-gradient-to-br from-yellow-900/60 via-yellow-700/40 to-yellow-950/90 border border-yellow-500",
        "energy-refill": "bg-gradient-to-br from-blue-900/60 via-blue-700/40 to-blue-950/90 border border-blue-500",
        "exp-booster": "bg-gradient-to-br from-green-900/60 via-green-700/40 to-green-950/90 border border-green-500",
        "rank-skip": "bg-gradient-to-br from-red-900/60 via-red-700/40 to-red-950/90 border border-red-500",
        "attribute-boost": "bg-gradient-to-br from-cyan-900/60 via-cyan-700/40 to-cyan-950/90 border border-cyan-500",
        "blueprint-fragment": "bg-gradient-to-br from-gray-700/60 via-gray-500/40 to-gray-800/90 border border-gray-400",
        "hack-gauge-booster": "bg-gradient-to-br from-teal-700/60 via-teal-500/40 to-teal-800/90 border border-teal-400",
        "attribute-respec-token": "bg-gradient-to-br from-orange-700/60 via-orange-500/40 to-orange-800/90 border border-orange-400",
        "sync-point-multiplier": "bg-gradient-to-br from-pink-700/60 via-pink-500/40 to-pink-800/90 border border-pink-400",
      },
      size: {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32",
      },
    },
    defaultVariants: {
      type: "energy-refill",
      size: "md",
    },
  }
);

export interface ItemImageProps extends VariantProps<typeof itemImageVariants> {
  type: "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "blueprint-fragment" | "hack-gauge-booster" | "attribute-respec-token" | "sync-point-multiplier";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const ItemImage = ({ type, size, className }: ItemImageProps) => {
  // Map of icon sizes based on the size prop
  const iconSizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };
  
  // Get the appropriate icon size or default to medium
  const iconSize = iconSizeMap[size || "md"];
  
  // Icon mapping for each item type with darker colors
  const iconMap = {
    "arena-pass": <Trophy className={`${iconSize} text-purple-700 font-bold`} strokeWidth={2.5} />,
    "gacha-ticket": <Ticket className={`${iconSize} text-yellow-700 font-bold`} strokeWidth={2.5} />,
    "energy-refill": <Zap className={`${iconSize} text-blue-700 font-bold`} strokeWidth={2.5} />,
    "exp-booster": <FastForward className={`${iconSize} text-green-700 font-bold`} strokeWidth={2.5} />,
    "rank-skip": <Coins className={`${iconSize} text-red-700 font-bold`} strokeWidth={2.5} />,
    "attribute-boost": <Activity className={`${iconSize} text-cyan-700 font-bold`} strokeWidth={2.5} />,
    "blueprint-fragment": <Puzzle className={`${iconSize} text-gray-500 font-bold`} strokeWidth={2.5} />,
    "hack-gauge-booster": <BarChart2 className={`${iconSize} text-teal-500 font-bold`} strokeWidth={2.5} />,
    "attribute-respec-token": <RefreshCcw className={`${iconSize} text-orange-500 font-bold`} strokeWidth={2.5} />,
    "sync-point-multiplier": <TrendingUp className={`${iconSize} text-pink-500 font-bold`} strokeWidth={2.5} />,
  };

  const shineEffect = "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:opacity-70";

  return (
    <div className={cn(itemImageVariants({ type, size }), shineEffect, className)}>
      {/* Decorative elements to make it look like a card */}
      <div className="absolute top-0 left-0 w-full h-1/6 bg-gradient-to-b from-white/20 to-transparent"></div>
      <div className="absolute inset-0 border-4 border-white/5 pointer-events-none"></div>
      
      {/* Card icon with increased visibility - adding background for better contrast */}
      <div className="flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-full p-2 w-3/4 h-3/4 aspect-square">
        {iconMap[type]}
      </div>
      
      {/* Card shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
    </div>
  );
};
