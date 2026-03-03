// ============================================================================
// Arena V2 AI Controller
// AI decision-making for auto-battle opponents
// ============================================================================

import type {
  ArenaFighter,
  BattleState,
  ActionCard,
  AIDecision,
  AIPersonality,
} from '@/types/arena';

import { ArenaCombatEngine } from './combat-engine';

// ============================================================================
// AI Controller
// ============================================================================

export class ArenaAI {
  private personality: AIPersonality;
  private difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  constructor(difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium') {
    this.difficulty = difficulty;
    this.personality = this.generatePersonality(difficulty);
  }
  
  // ============================================================================
  // Main Decision Method
  // ============================================================================
  
  selectAction(
    state: BattleState,
    availableCards: ActionCard[],
    isPlayerAI: boolean = false
  ): AIDecision {
    const self = isPlayerAI ? state.player : state.opponent;
    const opponent = isPlayerAI ? state.opponent : state.player;
    
    // Filter playable cards
    const playableCards = availableCards.filter(card => 
      this.canPlayCard(card, self, state)
    );
    
    if (playableCards.length === 0) {
      return {
        selectedCard: null,
        enterDefenseMode: true,
        useSpecialAbility: false,
        confidence: 1.0,
        reasoning: 'No playable cards available - entering defense mode',
      };
    }
    
    // Check 1: Can use finisher? (HIGHEST PRIORITY)
    if (this.canAndShouldUseFinisher(self, opponent, state)) {
      const finishers = playableCards.filter(card => card.type === 'finisher');
      if (finishers.length > 0) {
        console.log('[AI] 🔥 FINISHER AVAILABLE! Special Meter:', self.specialMeter);
        return {
          selectedCard: finishers[0],
          enterDefenseMode: false,
          useSpecialAbility: true,
          confidence: 0.98,
          reasoning: `Finisher ready! Special Meter: ${self.specialMeter}/100`,
        };
      }
    }
    
    // Check 2: Are we CRITICALLY low on stamina? (Only defend if exhausted/gassed)
    if (self.staminaState === 'exhausted' || (self.staminaState === 'gassed' && self.stamina <= 1)) {
      const defenseCards = playableCards.filter(card => card.type === 'defense');
      if (defenseCards.length > 0) {
        return {
          selectedCard: this.selectBestDefenseCard(defenseCards, self, opponent),
          enterDefenseMode: true,
          useSpecialAbility: false,
          confidence: 0.85,
          reasoning: `CRITICAL stamina (${self.stamina}/${self.maxStamina}) - must recover`,
        };
      }
    }
    
    // Check 3: Can use finisher?
    
    // Check 4: Opponent in defense mode? Be aggressive
    if (opponent.isInDefenseMode) {
      const aggressive = Math.random() < this.personality.aggression;
      if (aggressive) {
        const strongStrikes = playableCards
          .filter(card => card.type === 'strike')
          .sort((a, b) => b.baseDamage - a.baseDamage);
        
        if (strongStrikes.length > 0) {
          return {
            selectedCard: strongStrikes[0],
            enterDefenseMode: false,
            useSpecialAbility: false,
            confidence: 0.8,
            reasoning: 'Opponent defending - pressing the attack',
          };
        }
      }
    }
    
    // Check 5: Am I winning? Play safely but still aggressive
    const hpAdvantage = self.currentHP - opponent.currentHP;
    if (hpAdvantage > 30 && self.stamina >= 3) {
      const safePlay = Math.random() < (1 - this.personality.riskTolerance);
      if (safePlay) {
        // Choose balanced offensive cards (strikes only, no defense!)
        const safeCards = playableCards
          .filter(card => card.type === 'strike')
          .sort((a, b) => a.staminaCost - b.staminaCost);
        
        if (safeCards.length > 0) {
          return {
            selectedCard: safeCards[0],
            enterDefenseMode: false,
            useSpecialAbility: false,
            confidence: 0.7,
            reasoning: 'Large HP lead - playing conservatively with strikes',
          };
        }
      }
    }
    
    // Check 6: Am I losing badly? Take risks with combos
    if (hpAdvantage < -30 && self.stamina >= 3) {
      const riskPlay = Math.random() < this.personality.riskTolerance;
      if (riskPlay) {
        // Go for combos or high-damage strikes
        const riskCards = playableCards
          .filter(card => card.type === 'combo' || (card.type === 'strike' && card.baseDamage > 15))
          .sort((a, b) => b.baseDamage - a.baseDamage);
        
        if (riskCards.length > 0) {
          return {
            selectedCard: riskCards[0],
            enterDefenseMode: false,
            useSpecialAbility: false,
            confidence: 0.75,
            reasoning: 'Behind on HP - aggressive combo play',
          };
        }
      }
    }
    
    // Default: Score all cards and pick best
    const scoredCards = playableCards.map(card => ({
      card,
      score: this.scoreCard(card, self, opponent, state),
    }));
    
    scoredCards.sort((a, b) => b.score - a.score);
    
    const bestCard = scoredCards[0].card;
    const confidence = Math.min(0.9, scoredCards[0].score / 100);
    
    return {
      selectedCard: bestCard,
      enterDefenseMode: bestCard.type === 'defense',
      useSpecialAbility: bestCard.type === 'finisher' || bestCard.type === 'special',
      confidence,
      reasoning: `Best card by scoring (${scoredCards[0].score.toFixed(1)} points)`,
      alternativeCards: scoredCards.slice(1, 3).map(sc => sc.card),
    };
  }
  
  // ============================================================================
  // Decision Logic
  // ============================================================================
  
  
  private canAndShouldUseFinisher(
    self: ArenaFighter,
    opponent: ArenaFighter,
    state: BattleState
  ): boolean {
    // Check if finisher is possible (special meter >= 100)
    if (!ArenaCombatEngine.canUseFinisher(self, opponent)) {
      return false;
    }
    
    // Always use if opponent has low HP (can KO)
    if (opponent.currentHP < 30) return true;
    
    // Use if we have good stamina and special meter is ready
    if (self.stamina >= 3) return true;
    
    // Use if we're behind and need a big play
    if (self.currentHP < opponent.currentHP - 20) return true;
    
    // Otherwise, use based on personality (but bias toward using it)
    return Math.random() < (0.7 + this.personality.riskTolerance * 0.3);
  }
  
  // ============================================================================
  // Card Scoring
  // ============================================================================
  
  private scoreCard(
    card: ActionCard,
    self: ArenaFighter,
    opponent: ArenaFighter,
    state: BattleState
  ): number {
    let score = 0;
    
    // HUGE base score from damage (prioritize offense!)
    score += card.baseDamage * 2.0; // Increased from 0.5
    
    // Efficiency: damage per stamina
    const efficiency = card.baseDamage / Math.max(1, card.staminaCost);
    score += efficiency * 20; // Increased from 15
    
    // Speed modifier bonus
    score += card.speedModifier * 10;
    
    // Special meter gain potential
    score += (card.baseDamage * 0.5);
    
    // Stamina check
    const staminaAfter = self.stamina - card.staminaCost;
    
    // Only penalize if would leave us with 0-1 stamina
    if (staminaAfter <= 0) {
      score -= 100; // Can't afford it
    } else if (staminaAfter === 1) {
      score -= 30; // Risky but sometimes worth it
    }
    
    // BONUS for having good stamina after
    if (staminaAfter >= 4) {
      score += 15;
    }
    
    // Type-specific scoring
    switch (card.type) {
      case 'strike':
        // Always prefer strikes! They're the bread and butter
        score += 50; // Big base bonus for strikes
        score += this.personality.aggression * 30; // Increased from 20
        
        // Extra bonus if we have good stamina
        if (self.stamina >= 3) {
          score += 20;
        }
        break;
      
      case 'defense':
        // Defense should ONLY be used when truly needed
        // Base score is now VERY low
        score -= 30; // Start with penalty!
        
        // Only make it attractive if we're in dire straits
        if (self.staminaState === 'exhausted') {
          score += 80; // Make it worth it when exhausted
        } else if (self.stamina <= 1) {
          score += 50; // Moderate bonus when very low
        } else {
          // Otherwise keep it unattractive
          score -= 20;
        }
        break;
      
      case 'combo':
        // Combos are great when we can afford them!
        score += 40; // Good base bonus
        score += this.personality.comboPreference * 30; // Increased from 25
        
        // Prefer combos when we have stamina
        if (self.stamina >= card.staminaCost + 2) {
          score += 25;
        } else if (self.stamina < card.staminaCost + 1) {
          score -= 20; // Slight penalty if we'd be left with nothing
        }
        break;
      
      case 'finisher':
        // Finishers are ALWAYS high priority when available
        score += 150; // Huge bonus!
        if (opponent.currentHP < 40) score += 75; // Even better if can KO
        if (opponent.currentHP < 25) score += 100; // Almost guaranteed KO
        break;
    }
    
    // Momentum-based adjustment
    if (this.personality.momentumBased) {
      const hpAdvantage = self.currentHP - opponent.currentHP;
      if (hpAdvantage > 0) {
        // Winning - be more aggressive
        if (card.type === 'strike' || card.type === 'combo') {
          score += 15;
        }
      } else {
        // Losing - be more defensive
        if (card.type === 'defense') {
          score += 15;
        }
      }
    }
    
    // Difficulty-based randomness
    const randomFactor = this.getRandomnessFactor();
    score += (Math.random() - 0.5) * randomFactor;
    
    return Math.max(0, score);
  }
  
  private selectBestDefenseCard(
    defenseCards: ActionCard[],
    self: ArenaFighter,
    opponent: ArenaFighter
  ): ActionCard {
    // Prefer counter-enabling cards if intelligence is high
    if (self.intelligence > 70 && this.personality.defenseStyle === 'counter') {
      const counterCards = defenseCards.filter(card => 
        card.name.includes('Parry') || card.name.includes('Counter') || card.name.includes('Slip')
      );
      if (counterCards.length > 0) {
        return counterCards[0];
      }
    }
    
    // Otherwise, pick based on stamina cost
    defenseCards.sort((a, b) => a.staminaCost - b.staminaCost);
    return defenseCards[0];
  }
  
  // ============================================================================
  // Personality Generation
  // ============================================================================
  
  private generatePersonality(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): AIPersonality {
    switch (difficulty) {
      case 'easy':
        return {
          aggression: 0.4,
          patience: 0.3,
          riskTolerance: 0.3,
          adaptability: 0.2,
          preferredRange: 'mid',
          comboPreference: 0.2,
          defenseStyle: 'block',
          staminaConservation: 0.5, // Increased from 0.3 - even easy AI manages stamina
          recoveryThreshold: 4, // Decreased from 5 - recover earlier
          readOpponent: false,
          baitAndPunish: false,
          momentumBased: false,
        };
      
      case 'medium':
        return {
          aggression: 0.6,
          patience: 0.5,
          riskTolerance: 0.5,
          adaptability: 0.5,
          preferredRange: 'adaptive',
          comboPreference: 0.5,
          defenseStyle: 'mixed',
          staminaConservation: 0.7, // Increased from 0.5 - better stamina management
          recoveryThreshold: 4, // Keep at 4 - good balance
          readOpponent: false,
          baitAndPunish: false,
          momentumBased: true,
        };
      
      case 'hard':
        return {
          aggression: 0.7,
          patience: 0.7,
          riskTolerance: 0.6,
          adaptability: 0.7,
          preferredRange: 'adaptive',
          comboPreference: 0.7,
          defenseStyle: 'counter',
          staminaConservation: 0.8, // Increased from 0.7 - very good stamina management
          recoveryThreshold: 4, // Increased from 3 - recover slightly earlier
          readOpponent: true,
          baitAndPunish: true,
          momentumBased: true,
        };
      
      case 'expert':
        return {
          aggression: 0.8,
          patience: 0.9,
          riskTolerance: 0.7,
          adaptability: 0.9,
          preferredRange: 'adaptive',
          comboPreference: 0.8,
          defenseStyle: 'counter',
          staminaConservation: 0.9, // Keep at 0.9 - expert stamina management
          recoveryThreshold: 4, // Increased from 3 - even experts recover proactively
          readOpponent: true,
          baitAndPunish: true,
          momentumBased: true,
        };
    }
  }
  
  private getRandomnessFactor(): number {
    switch (this.difficulty) {
      case 'easy': return 40; // High randomness
      case 'medium': return 20;
      case 'hard': return 10;
      case 'expert': return 5; // Very consistent
    }
  }
  
  // ============================================================================
  // Helpers
  // ============================================================================
  
  private canPlayCard(card: ActionCard, fighter: ArenaFighter, state: BattleState): boolean {
    // Check stamina cost
    if (fighter.stamina < card.staminaCost) return false;
    
    // Check if in defense mode
    if (fighter.isInDefenseMode && card.type !== 'defense') return false;
    
    // Check exhausted state
    if (fighter.staminaState === 'exhausted' && (card.type === 'combo' || card.type === 'finisher')) {
      return false;
    }
    
    return true;
  }
  
  // ============================================================================
  // Public Utility Methods
  // ============================================================================
  
  /**
   * Get personality for inspection/debugging
   */
  getPersonality(): AIPersonality {
    return { ...this.personality };
  }
  
  /**
   * Update personality dynamically (for adaptive AI)
   */
  adjustPersonality(adjustments: Partial<AIPersonality>): void {
    this.personality = { ...this.personality, ...adjustments };
  }
  
  /**
   * Create a random personality (for variety)
   */
  static generateRandomPersonality(): AIPersonality {
    return {
      aggression: 0.3 + Math.random() * 0.5,
      patience: 0.3 + Math.random() * 0.5,
      riskTolerance: 0.3 + Math.random() * 0.5,
      adaptability: 0.3 + Math.random() * 0.6,
      preferredRange: ['close', 'mid', 'far', 'adaptive'][Math.floor(Math.random() * 4)] as any,
      comboPreference: Math.random(),
      defenseStyle: ['block', 'evade', 'counter', 'mixed'][Math.floor(Math.random() * 4)] as any,
      staminaConservation: Math.random(),
      recoveryThreshold: 2 + Math.floor(Math.random() * 4),
      readOpponent: Math.random() > 0.6,
      baitAndPunish: Math.random() > 0.7,
      momentumBased: Math.random() > 0.5,
    };
  }
}
