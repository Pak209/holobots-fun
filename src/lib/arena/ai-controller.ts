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
    
    // === CRITICAL: Stamina Management First ===
    // Check if we need to recover stamina BEFORE we run out
    const staminaBuffer = this.getStaminaBuffer();
    const needsRecovery = this.needsStaminaRecovery(self, opponent, staminaBuffer);
    
    if (needsRecovery) {
      const defenseCards = playableCards.filter(card => card.type === 'defense');
      if (defenseCards.length > 0) {
        return {
          selectedCard: this.selectBestDefenseCard(defenseCards, self, opponent),
          enterDefenseMode: true,
          useSpecialAbility: false,
          confidence: 0.95,
          reasoning: `Stamina management: ${self.stamina}/${self.maxStamina} - recovering proactively`,
        };
      }
    }
    
    // Check 1: Should enter defense mode? (Legacy check for exhausted state)
    if (this.shouldEnterDefenseMode(self, opponent)) {
      const defenseCards = playableCards.filter(card => card.type === 'defense');
      if (defenseCards.length > 0) {
        return {
          selectedCard: this.selectBestDefenseCard(defenseCards, self, opponent),
          enterDefenseMode: true,
          useSpecialAbility: false,
          confidence: 0.9,
          reasoning: 'Low stamina - recovering via defense',
        };
      }
    }
    
    // Check 2: Can use finisher?
    if (this.canAndShouldUseFinisher(self, opponent, state)) {
      const finishers = playableCards.filter(card => card.type === 'finisher');
      if (finishers.length > 0) {
        const shouldUse = Math.random() < (this.personality.riskTolerance * 0.8 + 0.2);
        if (shouldUse) {
          return {
            selectedCard: finishers[0],
            enterDefenseMode: false,
            useSpecialAbility: true,
            confidence: 0.95,
            reasoning: 'Finisher available and opponent vulnerable',
          };
        }
      }
    }
    
    // Check 3: Opponent in defense mode? Be aggressive
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
    
    // Check 4: Am I winning? Play safer
    const hpAdvantage = self.currentHP - opponent.currentHP;
    if (hpAdvantage > 30) {
      const safePlay = Math.random() < (1 - this.personality.riskTolerance);
      if (safePlay) {
        // Choose balanced/defensive cards
        const safeCards = playableCards
          .filter(card => card.type === 'strike' || card.type === 'defense')
          .sort((a, b) => a.staminaCost - b.staminaCost); // prefer low cost
        
        if (safeCards.length > 0) {
          return {
            selectedCard: safeCards[0],
            enterDefenseMode: false,
            useSpecialAbility: false,
            confidence: 0.7,
            reasoning: 'Large HP lead - playing conservatively',
          };
        }
      }
    }
    
    // Check 5: Am I losing badly? Take risks
    if (hpAdvantage < -30) {
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
            reasoning: 'Behind on HP - taking calculated risk',
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
  
  /**
   * NEW: Proactive stamina recovery system
   * Prevents AI from exhausting itself by planning ahead
   */
  private needsStaminaRecovery(
    self: ArenaFighter, 
    opponent: ArenaFighter,
    staminaBuffer: number
  ): boolean {
    // If we're exhausted or gassed, definitely recover
    if (self.staminaState === 'exhausted') return true;
    if (self.staminaState === 'gassed' && Math.random() < 0.85) return true;
    
    // Check if stamina is below buffer threshold
    if (self.stamina <= staminaBuffer) {
      // Don't recover if opponent is very low HP and we can finish them
      if (opponent.currentHP < 25 && self.stamina >= 2) {
        return false; // Go for the kill
      }
      return true;
    }
    
    // Calculate "stamina sustainability" - can we afford our cheapest offensive card?
    const offensiveCards = self.hand.filter(c => c.type !== 'defense');
    if (offensiveCards.length > 0) {
      const cheapestOffensive = Math.min(...offensiveCards.map(c => c.staminaCost));
      // If we can't afford even our cheapest attack, recover
      if (self.stamina < cheapestOffensive + 1) {
        return true;
      }
    }
    
    // Adaptive recovery based on opponent aggression
    // If opponent is also low on stamina, we can afford to recover
    if (opponent.stamina <= 3 && self.stamina <= 4) {
      return Math.random() < 0.6; // 60% chance to recover when both are low
    }
    
    return false;
  }
  
  /**
   * Get stamina buffer threshold (don't let stamina drop below this)
   */
  private getStaminaBuffer(): number {
    const baseBuffer = this.personality.staminaConservation * 4; // 0-4 range
    
    // Adjust based on difficulty
    switch (this.difficulty) {
      case 'easy': return Math.max(2, baseBuffer);
      case 'medium': return Math.max(3, baseBuffer);
      case 'hard': return Math.max(4, baseBuffer);
      case 'expert': return Math.max(4, baseBuffer + 1);
    }
  }
  
  private shouldEnterDefenseMode(self: ArenaFighter, opponent: ArenaFighter): boolean {
    // Check stamina state
    if (self.staminaState === 'exhausted') return true;
    if (self.staminaState === 'gassed') {
      return Math.random() < 0.8; // 80% chance when gassed
    }
    
    // Check HP differential
    const hpPercent = self.currentHP / self.maxHP;
    if (hpPercent < 0.3 && self.stamina < 4) {
      return Math.random() < 0.7; // 70% chance when low HP and stamina
    }
    
    // Personality-based
    const defenseThreshold = this.personality.recoveryThreshold;
    return self.stamina <= defenseThreshold;
  }
  
  private canAndShouldUseFinisher(
    self: ArenaFighter,
    opponent: ArenaFighter,
    state: BattleState
  ): boolean {
    // Check if finisher is possible
    if (!ArenaCombatEngine.canUseFinisher(self, opponent)) {
      return false;
    }
    
    // Always use if opponent has very low HP
    if (opponent.currentHP < 20) return true;
    
    // Risk tolerance affects willingness to use finisher
    const useThreshold = 1 - this.personality.riskTolerance;
    return Math.random() > useThreshold;
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
    
    // Base score from damage
    score += card.baseDamage * 0.5;
    
    // Efficiency: damage per stamina (MORE IMPORTANT NOW)
    const efficiency = card.baseDamage / Math.max(1, card.staminaCost);
    score += efficiency * 15; // Increased from 10
    
    // Speed modifier bonus
    score += card.speedModifier * 10;
    
    // Special meter gain potential
    score += (card.baseDamage * 0.3); // approximate meter gain
    
    // === NEW: Stamina Sustainability Check ===
    const staminaAfter = self.stamina - card.staminaCost;
    const staminaBuffer = this.getStaminaBuffer();
    
    // HEAVY penalty if this move would put us below buffer
    if (staminaAfter < staminaBuffer) {
      score -= 60; // Make this very unattractive
    }
    
    // SEVERE penalty if would leave us exhausted
    if (staminaAfter <= 1) {
      score -= 80; // Increased from 30
    }
    
    // Moderate penalty if would leave us gassed
    if (staminaAfter <= 2) {
      score -= 40;
    }
    
    // BONUS for sustainable plays (leaves us with good stamina)
    if (staminaAfter >= 5) {
      score += 25; // Reward sustainable aggression
    }
    
    // Type-specific scoring
    switch (card.type) {
      case 'strike':
        // Prefer strikes when aggressive AND have stamina
        if (self.stamina >= 4) {
          score += this.personality.aggression * 20;
        } else {
          score += this.personality.aggression * 5; // Much less when low stamina
        }
        break;
      
      case 'defense':
        // Prefer defense when patient or low stamina
        score += this.personality.patience * 15;
        if (self.stamina < 4) score += 40; // Increased from 30
        
        // BONUS: Defense cards often restore stamina!
        if (card.staminaCost === 0) {
          score += 20; // Free cards are great
        }
        break;
      
      case 'combo':
        // Prefer combos when have PLENTY of stamina and combo preference
        if (self.stamina >= card.staminaCost + 3) { // Increased buffer from 2 to 3
          score += this.personality.comboPreference * 25;
        } else {
          score -= 40; // Increased penalty from 20 to 40
        }
        break;
      
      case 'finisher':
        // Finishers are high value but situational
        score += 100;
        if (opponent.currentHP < 30) score += 50; // bonus if likely to KO
        // Only use finisher if we have enough stamina left
        if (staminaAfter < 2) score -= 50;
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
