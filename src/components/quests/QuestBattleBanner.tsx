import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { HOLOBOT_STATS } from "@/types/holobot";
import { ShieldAlert, Swords } from "lucide-react";
import { UserHolobot } from "@/types/user";
import { useAuth } from "@/contexts/auth";

interface QuestBattleBannerProps {
  playerHolobots?: UserHolobot[];
  bossHolobot?: string;
  onBattleComplete?: () => void;
  difficulty?: string;
  isVisible?: boolean;
  isBossQuest?: boolean;
  squadHolobotKeys?: string[];
  bossHolobotKey?: string;
  onComplete?: () => void;
}

export const QuestBattleBanner = ({ 
  playerHolobots,
  bossHolobot,
  onBattleComplete,
  difficulty = "normal",
  isVisible = true,
  isBossQuest = false,
  squadHolobotKeys = [],
  bossHolobotKey = "",
  onComplete
}: QuestBattleBannerProps) => {
  const { user } = useAuth();
  
  const [visible, setVisible] = useState(isVisible);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [battleText, setBattleText] = useState<string>("");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);
  const [battleRound, setBattleRound] = useState(0);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);

  // Safely get holobots from user data to prevent issues with squadHolobotKeys
  const getValidSquadHolobots = () => {
    if (!squadHolobotKeys || !Array.isArray(squadHolobotKeys) || !squadHolobotKeys.length) {
      return [];
    }
    
    // Filter out any undefined holobot keys
    return squadHolobotKeys.filter(key => !!key);
  };
  
  const validSquadHolobotKeys = getValidSquadHolobots();

  const actualPlayerHolobots = playerHolobots || 
    (user?.holobots?.filter(holobot => 
      validSquadHolobotKeys.some(key => 
        key && HOLOBOT_STATS[key]?.name?.toLowerCase() === holobot.name?.toLowerCase()
      )
    ) || []);
  
  // Safely get the boss holobot and provide fallback if key is invalid
  const safeGetBossHolobot = () => {
    if (!bossHolobotKey && !bossHolobot) {
      return "ace"; // Default fallback
    }
    
    const key = (bossHolobotKey || bossHolobot || "").toLowerCase();
    return HOLOBOT_STATS[key] ? key : "ace";
  };
  
  const actualBossHolobot = safeGetBossHolobot();
  
  const boss = HOLOBOT_STATS[actualBossHolobot] || { 
    name: "Unknown Boss", 
    attack: 50,
    defense: 50,
    maxHealth: 100,
    speed: 50
  };
  
  // Safety check for team stats to prevent undefined errors
  const calculateTeamStats = () => {
    try {
      return actualPlayerHolobots.reduce((stats, holobot) => {
        const baseStatsKey = Object.keys(HOLOBOT_STATS).find(
          key => HOLOBOT_STATS[key].name.toLowerCase() === holobot.name?.toLowerCase()
        );
        
        if (baseStatsKey) {
          const baseStats = HOLOBOT_STATS[baseStatsKey];
          
          stats.attack += baseStats.attack + (holobot.boostedAttributes?.attack || 0);
          stats.defense += baseStats.defense + (holobot.boostedAttributes?.defense || 0);
          stats.health += baseStats.maxHealth + (holobot.boostedAttributes?.health || 0);
          stats.speed += baseStats.speed + (holobot.boostedAttributes?.speed || 0);
        } else {
          // Use default stats if no base stats found
          stats.attack += 50;
          stats.defense += 50;
          stats.health += 100;
          stats.speed += 50;
        }
        return stats;
      }, { attack: 0, defense: 0, health: 0, speed: 0 });
    } catch (error) {
      console.error("Error calculating team stats:", error);
      // Return fallback stats
      return { attack: 100, defense: 100, health: 200, speed: 100 };
    }
  };
  
  const teamStats = calculateTeamStats();
  
  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case "easy": return 0.8;
      case "normal": return 1;
      case "hard": return 1.3;
      case "elite": return 1.6;
      case "champion": return 2;
      default: return 1;
    }
  };
  
  const bossMultiplier = getDifficultyMultiplier();
  const adjustedBossStats = {
    attack: boss.attack * bossMultiplier,
    defense: boss.defense * bossMultiplier,
    health: boss.maxHealth * bossMultiplier,
    speed: boss.speed * bossMultiplier,
  };
  
  // Set up battle visibility and auto-completion timeout
  useEffect(() => {
    setVisible(isVisible);
    if (isVisible) {
      setBattlePhase('intro');
      setPlayerHealth(100);
      setBossHealth(100);
      setBattleRound(0);
      setBattleResult(null);
      setBattleText(`Battle with ${boss.name} is starting!`);
      
      // Safety timeout to ensure battle completes even if there are issues
      const completionTimeout = setTimeout(() => {
        if (visible) {
          console.log("Force completing battle due to timeout");
          setVisible(false);
          if (onComplete) onComplete();
        }
      }, 30000); // 30 seconds max for a battle to complete
      
      return () => clearTimeout(completionTimeout);
    }
  }, [isVisible, boss.name]);
  
  // Handle battle phases
  useEffect(() => {
    if (!visible) return;
    
    let battleTimer: ReturnType<typeof setTimeout>;
    
    if (battlePhase === 'intro') {
      setBattleText(`Battle with ${boss.name} is starting!`);
      battleTimer = setTimeout(() => {
        setBattlePhase('battle');
        setBattleRound(1);
        setBattleText("Round 1 begins!");
      }, 2000);
    } else if (battlePhase === 'battle') {
      if (battleRound > 0 && battleRound <= 5) {
        battleTimer = setTimeout(() => {
          const playerFastAttack = teamStats.speed > adjustedBossStats.speed;
          
          let newBossHealth = bossHealth;
          let newPlayerHealth = playerHealth;
          
          if (playerFastAttack) {
            const playerDamage = Math.max(5, teamStats.attack - (adjustedBossStats.defense * 0.5));
            newBossHealth = Math.max(0, bossHealth - (playerDamage / adjustedBossStats.health * 100));
            setBattleText(`Your team attacks for ${playerDamage.toFixed(0)} damage!`);
            
            if (newBossHealth > 0) {
              setTimeout(() => {
                const bossDamage = Math.max(5, adjustedBossStats.attack - (teamStats.defense * 0.4));
                newPlayerHealth = Math.max(0, playerHealth - (bossDamage / teamStats.health * 100));
                setBattleText(`${boss.name} counters for ${bossDamage.toFixed(0)} damage!`);
                setPlayerHealth(newPlayerHealth);
              }, 1000);
            }
          } else {
            const bossDamage = Math.max(5, adjustedBossStats.attack - (teamStats.defense * 0.4));
            newPlayerHealth = Math.max(0, playerHealth - (bossDamage / teamStats.health * 100));
            setBattleText(`${boss.name} attacks for ${bossDamage.toFixed(0)} damage!`);
            
            if (newPlayerHealth > 0) {
              setTimeout(() => {
                const playerDamage = Math.max(5, teamStats.attack - (adjustedBossStats.defense * 0.5));
                newBossHealth = Math.max(0, bossHealth - (playerDamage / adjustedBossStats.health * 100));
                setBattleText(`Your team counters for ${playerDamage.toFixed(0)} damage!`);
                setBossHealth(newBossHealth);
              }, 1000);
            }
          }
          
          setBossHealth(newBossHealth);
          setPlayerHealth(newPlayerHealth);
          
          if (newBossHealth <= 0 || newPlayerHealth <= 0 || battleRound >= 5) {
            setTimeout(() => {
              if (newBossHealth <= 0 || battleRound >= 5) {
                setBattleText(`Victory! You defeated ${boss.name}!`);
                setBattleResult('win');
              } else {
                setBattleText(`Defeat! ${boss.name} was too powerful!`);
                setBattleResult('loss');
              }
              setBattlePhase('result');
            }, 1500);
          } else {
            setTimeout(() => {
              setBattleRound(prevRound => prevRound + 1);
              setBattleText(`Round ${battleRound + 1} begins!`);
            }, 1500);
          }
        }, 1000);
      }
    } else if (battlePhase === 'result') {
      battleTimer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        } else if (onBattleComplete) {
          onBattleComplete();
        }
      }, 2000);
    }
    
    return () => {
      if (battleTimer) clearTimeout(battleTimer);
    };
  }, [battlePhase, battleRound, bossHealth, playerHealth, visible]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-4 bg-holobots-card rounded-lg border border-holobots-accent shadow-neon-lg">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-holobots-accent">{battleText}</h2>
          <div className="text-xs text-gray-400 mt-1">Round {battleRound}/5</div>
        </div>
        
        <div className="mb-6 space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-blue-400" />
              <span>Your Team</span>
            </div>
            <span>{Math.max(0, Math.round(playerHealth))}%</span>
          </div>
          <Progress 
            value={playerHealth} 
            className="h-3 bg-gray-700"
          />
          <div className="grid grid-cols-3 gap-1 mt-1">
            {/* Only show valid holobots to prevent 404 errors */}
            {validSquadHolobotKeys.map((key, idx) => {
              if (!key || !HOLOBOT_STATS[key]) return null;
              
              const holobotName = HOLOBOT_STATS[key]?.name || "Unknown";
              return (
                <div key={`key-${idx}`} className="text-[10px] text-center bg-blue-900/30 rounded px-1 py-0.5 truncate">
                  {holobotName}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Swords className="w-4 h-4 mr-1 text-red-400" />
              <span>{boss.name}</span>
            </div>
            <span>{Math.max(0, Math.round(bossHealth))}%</span>
          </div>
          <Progress 
            value={bossHealth} 
            className="h-3 bg-gray-700"
          />
          <div className="text-[10px] text-center mt-1 bg-red-900/30 rounded px-1 py-0.5">
            {isBossQuest ? "BOSS QUEST" : "EXPLORATION"} - {difficulty.toUpperCase()}
          </div>
        </div>
        
        {battleResult && (
          <div className={`mt-4 text-center p-2 rounded ${
            battleResult === 'win' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {battleResult === 'win' 
              ? '✨ VICTORY! ✨' 
              : '❌ DEFEAT! Try a stronger team or lower difficulty ❌'}
          </div>
        )}
      </div>
    </div>
  );
};
