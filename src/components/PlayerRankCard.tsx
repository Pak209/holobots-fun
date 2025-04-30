
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { playerRankColors } from "@/integrations/supabase/client";

// Define the requirements for each rank
const RANK_REQUIREMENTS = {
  Rookie: { description: "Starting rank", next: "Scout", requirement: "Obtain 1 Rare Holobot" },
  Scout: { description: "Beginner rank", next: "Champion", requirement: "Obtain 1 Champion Holobot" },
  Champion: { description: "Advanced rank", next: "Elite", requirement: "Obtain 10 Elite Holobots" },
  Elite: { description: "Expert rank", next: "Legend", requirement: "Obtain 10 Legendary Holobots" },
  Legend: { description: "Master rank", next: "Mythic", requirement: "Obtain 10 Legendary and 5 Prestiged Holobots" },
  Mythic: { description: "Ultimate rank", next: null, requirement: "Maximum rank achieved" }
};

interface PlayerRankCardProps {
  playerRank: keyof typeof playerRankColors;
  holobots?: any[];
  prestigeCount?: number;
}

export const PlayerRankCard = ({ 
  playerRank = "Rookie", 
  holobots = [], 
  prestigeCount = 0 
}: PlayerRankCardProps) => {
  
  // Count holobots by rank
  const holobotCounts = {
    Rare: holobots.filter(h => h.rank === "Rare").length,
    Champion: holobots.filter(h => h.rank === "Champion").length,
    Elite: holobots.filter(h => h.rank === "Elite").length,
    Legend: holobots.filter(h => h.rank === "Legendary").length, // Note: different naming
    Prestiged: holobots.filter(h => h.prestiged).length
  };
  
  // Calculate progress based on current rank
  const calculateProgress = (): { value: number, description: string } => {
    switch(playerRank) {
      case "Rookie":
        return { 
          value: Math.min(100, (holobotCounts.Rare / 1) * 100),
          description: `${holobotCounts.Rare}/1 Rare Holobots` 
        };
      case "Scout":
        return { 
          value: Math.min(100, (holobotCounts.Champion / 1) * 100),
          description: `${holobotCounts.Champion}/1 Champion Holobots` 
        };
      case "Champion":
        return { 
          value: Math.min(100, (holobotCounts.Elite / 10) * 100),
          description: `${holobotCounts.Elite}/10 Elite Holobots` 
        };
      case "Elite":
        return { 
          value: Math.min(100, (holobotCounts.Legend / 10) * 100),
          description: `${holobotCounts.Legend}/10 Legend Holobots` 
        };
      case "Legend":
        // For Legend, we need both 10 Legendary AND 5 Prestiged
        const legendProgress = Math.min(100, (holobotCounts.Legend / 10) * 100);
        const prestigeProgress = Math.min(100, (holobotCounts.Prestiged / 5) * 100);
        // Take the lower of the two as the overall progress
        const combinedValue = Math.min(legendProgress, prestigeProgress);
        return { 
          value: combinedValue,
          description: `${holobotCounts.Legend}/10 Legend & ${holobotCounts.Prestiged}/5 Prestiged` 
        };
      case "Mythic":
        return { value: 100, description: "Maximum Rank Achieved" };
      default:
        return { value: 0, description: "Unknown Rank" };
    }
  };
  
  const progress = calculateProgress();
  const rankInfo = RANK_REQUIREMENTS[playerRank];
  
  // Determine the color of the card based on rank
  const rankColor = playerRankColors[playerRank];
  const cardBorderStyle = { borderColor: rankColor };
  const titleStyle = { color: rankColor };
  
  return (
    <Card className="glass-morphism border-2" style={cardBorderStyle}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg" style={titleStyle}>
          <Trophy className="h-5 w-5" />
          Player Rank: {playerRank}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-app-textSecondary">{rankInfo.description}</span>
          {prestigeCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span>{prestigeCount} Prestiged</span>
            </div>
          )}
        </div>
        
        {rankInfo.next && (
          <>
            <div className="text-xs flex items-center gap-1">
              <TrendingUp className="h-3 w-3" style={{color: rankColor}} />
              <span>Next Rank: <span style={{color: playerRankColors[rankInfo.next as keyof typeof playerRankColors]}}>{rankInfo.next}</span></span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progress.description}</span>
              </div>
              
              <Progress value={progress.value} className="h-2" 
                style={{
                  backgroundColor: `${rankColor}20`, // 20% opacity
                  '--progress-color': rankColor
                } as React.CSSProperties} 
              />
              
              <div className="text-xs text-app-textSecondary">
                {rankInfo.requirement}
              </div>
            </div>
          </>
        )}
        
        {playerRank === "Mythic" && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Award className="h-5 w-5 text-rank-mythic" />
            <span className="text-sm">Maximum Rank Achieved!</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="text-xs p-1 bg-app-backgroundLight rounded">
            <div className="font-medium">Holobot Collection</div>
            <div className="grid grid-cols-2 gap-x-4 mt-1">
              <div>Rare: {holobotCounts.Rare}</div>
              <div>Champion: {holobotCounts.Champion}</div>
              <div>Elite: {holobotCounts.Elite}</div>
              <div>Legendary: {holobotCounts.Legend}</div>
            </div>
          </div>
          <div className="text-xs p-1 bg-app-backgroundLight rounded flex flex-col justify-center items-center">
            <div className="font-medium">Total Holobots</div>
            <div className="text-2xl mt-1 text-app-primary">{holobots.length}</div>
            <div className="mt-1">
              <span className="text-app-textSecondary">Prestiged:</span> {holobotCounts.Prestiged}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
