
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { HOLOBOT_STATS } from "@/types/holobot";
import { ShieldAlert, Swords } from "lucide-react";
import { UserHolobot } from "@/types/user";
import { useAuth } from "@/contexts/auth";

interface QuestBattleBannerProps {
  isBossBattle?: boolean;
  playerHolobots?: string[];
  bossHolobot?: string;
  onAnimationComplete?: () => void;
  difficulty?: string;
  fallbackImage?: string;
}

export const QuestBattleBanner: React.FC<QuestBattleBannerProps> = ({ 
  isBossBattle = false,
  playerHolobots = [],
  bossHolobot = "",
  onAnimationComplete,
  difficulty = "normal",
  fallbackImage = "/placeholder.svg"
}) => {
  const { user } = useAuth();
  
  const [visible, setVisible] = useState(true);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [battleText, setBattleText] = useState<string>("");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);
  const [battleRound, setBattleRound] = useState(0);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);
  
  // Get valid boss holobot
  const activeBossHolobot = bossHolobot && HOLOBOT_STATS[bossHolobot] ? bossHolobot : Object.keys(HOLOBOT_STATS)[0];
  
  const boss = HOLOBOT_STATS[activeBossHolobot] || { 
    name: "Unknown Boss", 
    attack: 50,
    defense: 50,
    maxHealth: 100,
    speed: 50
  };
  
  // Calculate team stats from holobot keys
  const calculateTeamStats = () => {
    return playerHolobots.reduce((stats, holobotKey) => {
      if (HOLOBOT_STATS[holobotKey]) {
        const baseStats = HOLOBOT_STATS[holobotKey];
        stats.attack += baseStats.attack;
        stats.defense += baseStats.defense;
        stats.health += baseStats.maxHealth;
        stats.speed += baseStats.speed;
      }
      return stats;
    }, { attack: 0, defense: 0, health: 0, speed: 0 });
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
  
  // Battle animation effect
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
            // Player attacks first
            const playerDamage = Math.max(5, teamStats.attack - (adjustedBossStats.defense * 0.5));
            newBossHealth = Math.max(0, bossHealth - (playerDamage / adjustedBossStats.health * 100));
            setBattleText(`Your team attacks for ${playerDamage.toFixed(0)} damage!`);
            setBossHealth(newBossHealth);
            
            if (newBossHealth > 0) {
              setTimeout(() => {
                // Boss counter-attacks
                const bossDamage = Math.max(5, adjustedBossStats.attack - (teamStats.defense * 0.4));
                newPlayerHealth = Math.max(0, playerHealth - (bossDamage / teamStats.health * 100));
                setBattleText(`${boss.name} counters for ${bossDamage.toFixed(0)} damage!`);
                setPlayerHealth(newPlayerHealth);
              }, 1000);
            }
          } else {
            // Boss attacks first
            const bossDamage = Math.max(5, adjustedBossStats.attack - (teamStats.defense * 0.4));
            newPlayerHealth = Math.max(0, playerHealth - (bossDamage / teamStats.health * 100));
            setBattleText(`${boss.name} attacks for ${bossDamage.toFixed(0)} damage!`);
            setPlayerHealth(newPlayerHealth);
            
            if (newPlayerHealth > 0) {
              setTimeout(() => {
                // Player counter-attacks
                const playerDamage = Math.max(5, teamStats.attack - (adjustedBossStats.defense * 0.5));
                newBossHealth = Math.max(0, bossHealth - (playerDamage / adjustedBossStats.health * 100));
                setBattleText(`Your team counters for ${playerDamage.toFixed(0)} damage!`);
                setBossHealth(newBossHealth);
              }, 1000);
            }
          }
          
          // Check battle conclusion
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
            // Continue to next round
            setTimeout(() => {
              setBattleRound(prevRound => prevRound + 1);
              setBattleText(`Round ${battleRound + 1} begins!`);
            }, 1500);
          }
        }, 1000);
      }
    } else if (battlePhase === 'result') {
      // Animation complete
      battleTimer = setTimeout(() => {
        setVisible(false);
        if (onAnimationComplete) {
          onAnimationComplete();
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
            {playerHolobots.slice(0, 3).map((key, idx) => {
              if (!key || !HOLOBOT_STATS[key]) return null;
              
              const holobotName = HOLOBOT_STATS[key]?.name || "Unknown";
              return (
                <div key={`player-${idx}`} className="text-[10px] text-center bg-blue-900/30 rounded px-1 py-0.5 truncate">
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
            {isBossBattle ? "BOSS QUEST" : "EXPLORATION"} - {difficulty.toUpperCase()}
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
