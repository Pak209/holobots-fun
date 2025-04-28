export interface HolobotStats {
  name: string;
  attack: number;
  defense: number;
  speed: number;
  hp?: number;
  maxHealth?: number;
  level?: number;
  specialMove?: string;
  intelligence?: number;
  fatigue?: number;
  gasTokens?: number;
  hackUsed?: boolean;
  specialAttackGauge?: number;
  specialAttackThreshold?: number;
  syncPoints?: number;
  comboChain?: number;
  maxComboChain?: number;
  abilityDescription?: string;
  abilityStats?: string;
  experience?: number;
  nextLevelExp?: number;
}

export function getRank(level: number): string {
  if (level >= 41) return "Legendary";
  if (level >= 31) return "Elite";
  if (level >= 21) return "Rare";
  if (level >= 11) return "Champion";
  if (level >= 2) return "Starter";
  return "Rookie";
} 