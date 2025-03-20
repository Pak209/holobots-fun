
import { useState } from "react";
import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Star } from "lucide-react";
import { QuestBattleBanner } from "@/components/quests/QuestBattleBanner";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { calculateSquadMemberXp } from "@/utils/battleUtils";

// Default team for demonstration
const DEFAULT_TEAM = ["ace", "nova", "shadow"];
const DEFAULT_BOSS = "kuma";

const Quests = () => {
  const { user } = useAuth();
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [battleResults, setBattleResults] = useState<{
    teamHolobots: string[];
    bossHolobot: string;
    teamHealth: number;
    bossHealth: number;
    questName: string;
    isVictory: boolean;
    holobotsResults: {
      name: string;
      level: number;
      currentXp: number;
      gainedXp: number;
      newLevel?: number;
    }[];
    rewards?: {
      holos?: number;
      items?: { name: string; type: string; quantity: number }[];
    };
  }>({
    teamHolobots: DEFAULT_TEAM,
    bossHolobot: DEFAULT_BOSS,
    teamHealth: 85,
    bossHealth: 70,
    questName: "Forest Guardian",
    isVictory: true,
    holobotsResults: [
      { name: "Ace", level: 5, currentXp: 300, gainedXp: 120 },
      { name: "Nova", level: 3, currentXp: 150, gainedXp: 150 },
      { name: "Shadow", level: 4, currentXp: 200, gainedXp: 135 }
    ],
    rewards: {
      holos: 25,
      items: [
        { name: "EXP Booster", type: "exp-booster", quantity: 1 },
        { name: "Attribute Boost", type: "attribute-boost", quantity: 2 }
      ]
    }
  });

  // Function to initiate battle sequence with banner and results
  const handleStartBattleSequence = (questData: {
    teamHolobots: string[];
    bossHolobot: string;
    questName: string;
    bossLevel: number;
    isVictory: boolean;
  }) => {
    // Create a realistic battle scenario with random health values
    const teamHealth = Math.floor(Math.random() * 30) + 70; // 70-100
    const bossHealth = questData.isVictory ? 
      Math.floor(Math.random() * 50) : // 0-50 for victory
      Math.floor(Math.random() * 30) + 70; // 70-100 for defeat
    
    // Calculate XP for each squad member based on battle outcome
    const baseXp = questData.bossLevel * 25;
    const victoryMultiplier = questData.isVictory ? 1.5 : 0.5;
    
    // Get holobot levels from user data or use defaults
    const holobotsResults = questData.teamHolobots.map(holobotName => {
      const userHolobot = user?.holobots?.find(h => h.name.toLowerCase() === holobotName);
      const level = userHolobot?.level || Math.floor(Math.random() * 5) + 1;
      const currentXp = userHolobot?.experience || 0;
      
      // Calculate XP gain based on level difference with boss
      const gainedXp = calculateSquadMemberXp(
        level, 
        questData.bossLevel, 
        baseXp, 
        victoryMultiplier
      );
      
      return {
        name: holobotName,
        level,
        currentXp,
        gainedXp,
        // If we wanted to calculate level up, we would do it here
      };
    });
    
    // Generate rewards
    const rewards = questData.isVictory ? {
      holos: questData.bossLevel * 5,
      items: [
        { 
          name: "EXP Booster", 
          type: "exp-booster", 
          quantity: Math.floor(Math.random() * 2) + 1 
        }
      ]
    } : undefined;
    
    // Update battle results state
    setBattleResults({
      teamHolobots: questData.teamHolobots,
      bossHolobot: questData.bossHolobot,
      teamHealth,
      bossHealth,
      questName: questData.questName,
      isVictory: questData.isVictory,
      holobotsResults,
      rewards
    });
    
    // Show battle banner
    setShowBattleBanner(true);
    
    // After banner animation, show results screen
    setTimeout(() => {
      setShowBattleBanner(false);
      setShowResultsScreen(true);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            HOLOBOT QUESTS
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Send your Holobots on adventures to earn rewards and level up
          </p>
          
          {/* XP Info Banner */}
          <div className="mt-4 max-w-md mx-auto p-2 bg-holobots-card/50 rounded-lg border border-holobots-accent/30 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-holobots-accent">
              All Holobots in your boss battle squad now earn XP!
            </p>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
        
        <QuestGrid onStartBattle={handleStartBattleSequence} />
        
        {/* Battle Banner Dialog */}
        <QuestBattleBanner
          isOpen={showBattleBanner}
          onClose={() => setShowBattleBanner(false)}
          teamHolobots={battleResults.teamHolobots}
          bossHolobot={battleResults.bossHolobot}
          teamHealth={battleResults.teamHealth}
          bossHealth={battleResults.bossHealth}
          questName={battleResults.questName}
        />
        
        {/* Results Screen Dialog */}
        <QuestResultsScreen
          isOpen={showResultsScreen}
          onClose={() => setShowResultsScreen(false)}
          results={battleResults.holobotsResults}
          isVictory={battleResults.isVictory}
          questName={battleResults.questName}
          questRewards={battleResults.rewards}
        />
      </div>
    </div>
  );
};

export default Quests;
