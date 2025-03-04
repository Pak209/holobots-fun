
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Coin, Zap, FastForward, Trophy, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define item card variants based on type
const itemCardVariants = cva(
  "relative p-4 rounded-lg shadow-md transition-all duration-300 flex flex-col justify-between border",
  {
    variants: {
      type: {
        "arena-pass": "bg-gradient-to-br from-purple-900/60 to-purple-950/90 border-purple-500 shadow-neon-purple hover:shadow-neon-purple/50",
        "gacha-ticket": "bg-gradient-to-br from-yellow-900/60 to-yellow-950/90 border-yellow-500 shadow-neon-yellow hover:shadow-neon-yellow/50",
        "energy-refill": "bg-gradient-to-br from-blue-900/60 to-blue-950/90 border-blue-500 shadow-neon-blue hover:shadow-neon-blue/50", 
        "exp-booster": "bg-gradient-to-br from-green-900/60 to-green-950/90 border-green-500 shadow-neon-green hover:shadow-neon-green/50",
        "rank-skip": "bg-gradient-to-br from-red-900/60 to-red-950/90 border-red-500 shadow-neon-red hover:shadow-neon-red/50",
      },
    },
    defaultVariants: {
      type: "arena-pass",
    },
  }
);

// Define props interface for the ItemCard component
export interface ItemCardProps extends VariantProps<typeof itemCardVariants> {
  name: string;
  description: string;
  quantity: number;
  type: "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip";
  onClick?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export const ItemCard = ({
  name,
  description,
  quantity,
  type,
  onClick,
  actionLabel,
  disabled = false,
}: ItemCardProps) => {
  // Icon mapping for each item type
  const iconMap = {
    "arena-pass": <Trophy className="h-5 w-5 text-purple-300" />,
    "gacha-ticket": <Ticket className="h-5 w-5 text-yellow-300" />,
    "energy-refill": <Zap className="h-5 w-5 text-blue-300" />,
    "exp-booster": <FastForward className="h-5 w-5 text-green-300" />,
    "rank-skip": <Coin className="h-5 w-5 text-red-300" />,
  };

  return (
    <div className={cn(itemCardVariants({ type }))}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {iconMap[type]}
          <h3 className="font-bold text-white">{name}</h3>
        </div>
        {quantity > 0 && (
          <Badge className="bg-black/40 text-white border-none">
            x{quantity}
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-gray-300 mb-3">{description}</p>
      
      {onClick && actionLabel && (
        <Button 
          onClick={onClick}
          disabled={disabled || quantity <= 0}
          size="sm"
          className="w-full mt-auto bg-black/40 hover:bg-black/60 border border-gray-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
