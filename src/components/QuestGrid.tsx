
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Hourglass, Swords, Clock } from "lucide-react";
import { HOLOBOT_STATS } from "@/types/holobot";

interface QuestGridProps {
  onStartBattle?: (questData: {
    teamHolobots: string[];
    bossHolobot: string;
    questName: string;
    bossLevel: number;
    isVictory: boolean;
  }) => void;
}

export const QuestGrid = ({ onStartBattle }: QuestGridProps) => {
  // Sample quest data - in a real app this would come from an API
  const quests = [
    {
      id: 'forest-guardian',
      name: 'Forest Guardian',
      description: 'Battle the robotic forest guardian who protects the ancient power core.',
      bossHolobot: 'kuma',
      bossLevel: 5,
      rewards: ['EXP Booster', 'Energy Refill'],
      duration: '10 min',
      energyCost: 20,
      teamHolobots: ['ace', 'nova', 'shadow']
    },
    {
      id: 'citadel-infiltration',
      name: 'Citadel Infiltration',
      description: 'Infiltrate the neon citadel and defeat the security mainframe.',
      bossHolobot: 'era',
      bossLevel: 8,
      rewards: ['Attribute Boost', 'Gacha Ticket'],
      duration: '15 min',
      energyCost: 30,
      teamHolobots: ['shadow', 'nova', 'ace']
    },
    {
      id: 'desert-outpost',
      name: 'Desert Outpost',
      description: 'Raid the desert outpost guarded by a powerful Holobot.',
      bossHolobot: 'ace',
      bossLevel: 7,
      rewards: ['Holos', 'Rank Skip'],
      duration: '12 min',
      energyCost: 25,
      teamHolobots: ['kuma', 'era', 'shadow']
    },
    {
      id: 'cyber-arena',
      name: 'Cyber Arena',
      description: 'Prove your worth in the cyber arena against a championship Holobot.',
      bossHolobot: 'nova',
      bossLevel: 10,
      rewards: ['Arena Pass', 'EXP Booster'],
      duration: '20 min',
      energyCost: 40,
      teamHolobots: ['ace', 'kuma', 'era']
    }
  ];
  
  const [activeQuest, setActiveQuest] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  
  const startQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    
    setActiveQuest(questId);
    
    // Set a cooldown timer
    setCooldowns(prev => ({
      ...prev,
      [questId]: Date.now() + (quest.duration.includes('10') ? 10 : 15) * 60 * 1000
    }));
    
    // Start battle visualization after a short delay
    setTimeout(() => {
      // Let's simulate a random outcome with 70% success rate
      const isVictory = Math.random() > 0.3;
      
      if (onStartBattle) {
        onStartBattle({
          teamHolobots: quest.teamHolobots,
          bossHolobot: quest.bossHolobot,
          questName: quest.name,
          bossLevel: quest.bossLevel,
          isVictory
        });
      }
      
      setActiveQuest(null);
    }, 2000);
  };
  
  // Function to check if a quest is on cooldown
  const isOnCooldown = (questId: string) => {
    const cooldownTime = cooldowns[questId];
    return cooldownTime && cooldownTime > Date.now();
  };
  
  // Function to format cooldown time
  const formatCooldown = (questId: string) => {
    const cooldownTime = cooldowns[questId];
    if (!cooldownTime) return '';
    
    const secondsLeft = Math.max(0, Math.floor((cooldownTime - Date.now()) / 1000));
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quests.map((quest) => (
        <Card key={quest.id} className="bg-holobots-card border border-holobots-border overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-holobots-accent">{quest.name}</h3>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs">{quest.duration}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">{quest.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 bg-black/50 rounded-full border border-red-500 overflow-hidden">
                    <img 
                      src={`/lovable-uploads/${HOLOBOT_STATS[quest.bossHolobot]?.image || "placeholder.png"}`}
                      alt={quest.bossHolobot}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-black text-xs px-1 rounded border border-red-500">
                    Lv.{quest.bossLevel}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Boss</div>
                  <div className="font-bold">{HOLOBOT_STATS[quest.bossHolobot]?.name || quest.bossHolobot}</div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Swords className="h-4 w-4 text-holobots-accent" />
                <span className="text-sm font-bold">VS</span>
                <span className="text-sm">Squad</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-300">Rewards:</span>
                <div className="flex gap-1">
                  {quest.rewards.map((reward, idx) => (
                    <span key={idx} className="text-xs bg-holobots-accent/20 px-1.5 py-0.5 rounded-full">
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-xs bg-black/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="text-holobots-accent font-bold">{quest.energyCost}</span>
                <span>energy</span>
              </div>
            </div>
            
            <Button
              onClick={() => startQuest(quest.id)}
              disabled={activeQuest === quest.id || isOnCooldown(quest.id)}
              className="w-full bg-holobots-accent hover:bg-holobots-hover"
            >
              {activeQuest === quest.id ? (
                <div className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4 animate-spin" />
                  <span>In Progress...</span>
                </div>
              ) : isOnCooldown(quest.id) ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Cooldown: {formatCooldown(quest.id)}</span>
                </div>
              ) : (
                <span>Start Quest</span>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
