
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { HOLOBOT_STATS } from "@/types/holobot";
import { ShieldAlert, Swords } from "lucide-react";
import { UserHolobot } from "@/types/user";

interface QuestBattleBannerProps {
  playerHolobots: UserHolobot[];
  bossHolobot: string;
  onBattleComplete?: () => void;
  difficulty?: string;
}

export const QuestBattleBanner = ({ 
  playerHolobots, 
  bossHolobot,
  onBattleComplete,
  difficulty = "normal"
}: QuestBattleBannerProps) => {
  // Battle simulation states
  const [isVisible, setIsVisible] = useState(true);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [battleText, setBattleText] = useState<string>("");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);
  const [battleRound, setBattleRound] = useState(0);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);

  // Get boss stats
  const boss = HOLOBOT_STATS[bossHolobot.toLowerCase()];
  
  // Calculate team combined stats
  const teamStats = playerHolobots.reduce((stats, holobot) => {
    const baseStats = HOLOBOT_STATS[holobot.name.toLowerCase()];
    stats.attack += baseStats.attack + (holobot.boostedAttributes?.attack || 0);
    stats.defense += baseStats.defense + (holobot.boostedAttributes?.defense || 0);
    stats.health += baseStats.maxHealth + (holobot.boostedAttributes?.health || 0);
    stats.speed += baseStats.speed + (holobot.boostedAttributes?.speed || 0);
    return stats;
  }, { attack: 0, defense: 0, health: 0, speed: 0 });
  
  // Adjust boss stats based on difficulty
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
  
  // Battle simulation
  useEffect(() => {
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
          // Simplified battle calculation
          const playerFastAttack = teamStats.speed > adjustedBossStats.speed;
          
          let newBossHealth = bossHealth;
          let newPlayerHealth = playerHealth;
          
          if (playerFastAttack) {
            // Player attacks first
            const playerDamage = Math.max(5, teamStats.attack - (adjustedBossStats.defense * 0.5));
            newBossHealth = Math.max(0, bossHealth - (playerDamage / adjustedBossStats.health * 100));
            setBattleText(`Your team attacks for ${playerDamage.toFixed(0)} damage!`);
            
            // If boss still alive, boss attacks
            if (newBossHealth > 0) {
              setTimeout(() => {
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
            
            // If player still alive, player attacks
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
          
          // Check for battle end
          if (newBossHealth <= 0 || newPlayerHealth <= 0) {
            setTimeout(() => {
              if (newBossHealth <= 0) {
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
      // Battle complete
      battleTimer = setTimeout(() => {
        setIsVisible(false);
        if (onBattleComplete) onBattleComplete();
      }, 2000);
    }
    
    return () => clearTimeout(battleTimer);
  }, [battlePhase, battleRound, bossHealth, playerHealth]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-4 bg-holobots-card rounded-lg border border-holobots-accent shadow-neon-lg">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-holobots-accent">{battleText}</h2>
          <div className="text-xs text-gray-400 mt-1">Round {battleRound}/5</div>
        </div>
        
        {/* Team Health Bar */}
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
            {playerHolobots.map((holobot, idx) => (
              <div key={idx} className="text-[10px] text-center bg-blue-900/30 rounded px-1 py-0.5 truncate">
                {holobot.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Boss Health Bar */}
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
            {difficulty.toUpperCase()} BOSS
          </div>
        </div>
        
        {/* Battle result indicator */}
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
