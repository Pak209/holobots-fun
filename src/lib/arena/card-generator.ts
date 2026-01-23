// ============================================================================
// Arena V2 Card Pool Generator
// Generates fighter-specific card pools from Holobot stats and equipment
// ============================================================================

import type {
  ActionCard,
  ArenaFighter,
  FighterArchetype,
  CardPool,
  CardGenerationConfig,
} from '@/types/arena';

import { generateUUID } from '@/utils/uuid';

// Card templates would normally come from Supabase
// For now, we'll define them here as a fallback

// ============================================================================
// Card Pool Generator
// ============================================================================

export class CardPoolGenerator {
  
  /**
   * Generate a complete card pool for a fighter
   */
  static async generateCardPool(config: CardGenerationConfig): Promise<CardPool> {
    const {archetype, tier, syncLevel } = config;
    
    // Get base archetype cards
    const archetypeCards = this.getArchetypeCards(archetype);
    
    // Get universal cards (available to all)
    const universalCards = this.getUniversalCards();
    
    // Combine and filter based on tier/sync level
    const strikeCards = [...archetypeCards.strikes, ...universalCards.strikes];
    const defenseCards = [...archetypeCards.defenses, ...universalCards.defenses];
    const comboCards = [...archetypeCards.combos, ...universalCards.combos];
    const finisherCards = this.getFinisherCards(archetype, tier);
    const specialCards = this.getSpecialCards(archetype, syncLevel);
    
    const totalCards = strikeCards.length + defenseCards.length + comboCards.length + finisherCards.length + specialCards.length;
    
    return {
      holobotId: config.holobotId,
      archetype,
      strikeCards,
      defenseCards,
      comboCards,
      finisherCards,
      specialCards,
      totalCards,
      averageStaminaCost: this.calculateAverageStaminaCost([...strikeCards, ...defenseCards]),
      averageDamage: this.calculateAverageDamage(strikeCards),
    };
  }
  
  /**
   * Draw starting hand for battle
   */
  static drawStartingHand(cardPool: CardPool, handSize: number = 6): ActionCard[] {
    const allCards = [
      ...cardPool.strikeCards,
      ...cardPool.defenseCards,
      ...cardPool.comboCards,
    ];
    
    // Shuffle and draw
    const shuffled = this.shuffleArray([...allCards]);
    return shuffled.slice(0, Math.min(handSize, shuffled.length));
  }
  
  // ============================================================================
  // Archetype-Specific Cards
  // ============================================================================
  
  private static getArchetypeCards(archetype: FighterArchetype): {
    strikes: ActionCard[];
    defenses: ActionCard[];
    combos: ActionCard[];
  } {
    switch (archetype) {
      case 'striker':
        return {
          strikes: [
            this.createCard({
              name: 'Speed Jab',
              type: 'strike',
              baseDamage: 10,
              staminaCost: 1,
              speedModifier: 1.3,
              description: 'Lightning-fast jab. Striker specialty.',
            }),
            this.createCard({
              name: 'Power Cross',
              type: 'strike',
              baseDamage: 16,
              staminaCost: 2,
              speedModifier: 1.0,
              description: 'Devastating straight. High damage.',
            }),
            this.createCard({
              name: 'Haymaker',
              type: 'strike',
              baseDamage: 28,
              staminaCost: 3,
              speedModifier: 0.7,
              description: 'All-in power strike. Slow but deadly.',
            }),
          ],
          defenses: [
            this.createCard({
              name: 'Quick Retreat',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 1,
              speedModifier: 1.2,
              description: 'Fast backstep. Avoid and reset.',
            }),
          ],
          combos: [
            this.createCard({
              name: 'Rush Combo',
              type: 'combo',
              baseDamage: 45,
              staminaCost: 4,
              speedModifier: 0.9,
              description: '5-hit aggressive barrage.',
            }),
          ],
        };
      
      case 'grappler':
        return {
          strikes: [
            this.createCard({
              name: 'Clinch Strike',
              type: 'strike',
              baseDamage: 14,
              staminaCost: 2,
              speedModifier: 0.8,
              description: 'Close-range power strike.',
            }),
            this.createCard({
              name: 'Body Slam',
              type: 'strike',
              baseDamage: 22,
              staminaCost: 3,
              speedModifier: 0.6,
              description: 'Heavy grappling attack. Drains opponent stamina.',
              effects: [{ type: 'stamina_drain', target: 'opponent', value: 1 }],
            }),
          ],
          defenses: [
            this.createCard({
              name: 'Iron Guard',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 0.9,
              description: 'Powerful block. High defense.',
              effects: [{ type: 'damage_reduction', target: 'self', value: 80 }],
            }),
            this.createCard({
              name: 'Sprawl',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.0,
              description: 'Perfect vs grapple attempts.',
            }),
          ],
          combos: [
            this.createCard({
              name: 'Ground and Pound',
              type: 'combo',
              baseDamage: 50,
              staminaCost: 5,
              speedModifier: 0.7,
              description: 'Grappler signature combo. Massive damage.',
            }),
          ],
        };
      
      case 'technical':
        return {
          strikes: [
            this.createCard({
              name: 'Precision Strike',
              type: 'strike',
              baseDamage: 12,
              staminaCost: 1,
              speedModifier: 1.1,
              description: 'Calculated strike. Efficient damage.',
            }),
            this.createCard({
              name: 'Counter Punch',
              type: 'strike',
              baseDamage: 18,
              staminaCost: 2,
              speedModifier: 1.3,
              description: 'Best used after defense. Bonus damage.',
            }),
          ],
          defenses: [
            this.createCard({
              name: 'Parry',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.2,
              description: 'Deflect and counter. Opens counter window.',
              effects: [{ type: 'counter_window', target: 'self', value: 1000 }],
            }),
            this.createCard({
              name: 'Slip',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.3,
              description: 'Perfect evasion. Counter opportunity.',
              effects: [{ type: 'counter_window', target: 'self', value: 800 }],
            }),
          ],
          combos: [
            this.createCard({
              name: 'Technical Sequence',
              type: 'combo',
              baseDamage: 40,
              staminaCost: 4,
              speedModifier: 1.0,
              description: 'Precise 5-hit combo. Stamina-efficient.',
              effects: [{ type: 'stamina_gain', target: 'self', value: 1 }],
            }),
          ],
        };
      
      case 'balanced':
      default:
        return {
          strikes: [
            this.createCard({
              name: 'Balanced Strike',
              type: 'strike',
              baseDamage: 12,
              staminaCost: 1,
              speedModifier: 1.0,
              description: 'Reliable strike. Good for all situations.',
            }),
            this.createCard({
              name: 'Adapt Strike',
              type: 'strike',
              baseDamage: 15,
              staminaCost: 2,
              speedModifier: 1.0,
              description: 'Versatile attack. Draw a card.',
              effects: [{ type: 'card_draw', target: 'self', value: 1 }],
            }),
          ],
          defenses: [
            this.createCard({
              name: 'Block',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 1,
              speedModifier: 1.0,
              description: 'Basic block. Reduces damage by 50%.',
            }),
            this.createCard({
              name: 'Counter Stance',
              type: 'defense',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.1,
              description: 'Balanced defense. Small counter window.',
              effects: [{ type: 'counter_window', target: 'self', value: 600 }],
            }),
          ],
          combos: [
            this.createCard({
              name: 'Standard Combo',
              type: 'combo',
              baseDamage: 38,
              staminaCost: 3,
              speedModifier: 1.0,
              description: '3-hit balanced combo.',
            }),
          ],
        };
    }
  }
  
  // ============================================================================
  // Universal Cards (available to all archetypes)
  // ============================================================================
  
  private static getUniversalCards(): {
    strikes: ActionCard[];
    defenses: ActionCard[];
    combos: ActionCard[];
  } {
    return {
      strikes: [
        this.createCard({
          name: 'Jab',
          type: 'strike',
          baseDamage: 8,
          staminaCost: 1,
          speedModifier: 1.2,
          description: 'Quick punch. Opens combo opportunities.',
        }),
        this.createCard({
          name: 'Cross',
          type: 'strike',
          baseDamage: 12,
          staminaCost: 1,
          speedModifier: 1.0,
          description: 'Straight power punch.',
        }),
        this.createCard({
          name: 'Hook',
          type: 'strike',
          baseDamage: 18,
          staminaCost: 2,
          speedModifier: 0.9,
          description: 'Powerful hook punch.',
        }),
        this.createCard({
          name: 'Low Kick',
          type: 'strike',
          baseDamage: 10,
          staminaCost: 1,
          speedModifier: 1.1,
          description: 'Fast leg strike.',
        }),
      ],
      defenses: [
        this.createCard({
          name: 'Block',
          type: 'defense',
          baseDamage: 0,
          staminaCost: 1,
          speedModifier: 1.0,
          description: 'Basic block. 50% damage reduction.',
        }),
        this.createCard({
          name: 'Retreat',
          type: 'defense',
          baseDamage: 0,
          staminaCost: 1,
          speedModifier: 1.1,
          description: 'Step back. Moderate protection.',
        }),
      ],
      combos: [
        this.createCard({
          name: 'One-Two',
          type: 'combo',
          baseDamage: 24,
          staminaCost: 2,
          speedModifier: 1.1,
          description: 'Classic jab-cross combo.',
        }),
        this.createCard({
          name: 'Jab-Cross-Hook',
          type: 'combo',
          baseDamage: 42,
          staminaCost: 3,
          speedModifier: 1.0,
          description: 'Standard 3-piece combo.',
        }),
      ],
    };
  }
  
  // ============================================================================
  // Finisher Cards (based on tier)
  // ============================================================================
  
  private static getFinisherCards(archetype: FighterArchetype, tier: number): ActionCard[] {
    const finishers: ActionCard[] = [];
    
    // Universal finisher (all tiers)
    finishers.push(
      this.createCard({
        name: 'Devastating Strike',
        type: 'finisher',
        baseDamage: 100,
        staminaCost: 6,
        speedModifier: 0.5,
        description: 'Ultimate power strike. Cinematic finish.',
        requirements: [
          { type: 'special_meter', operator: 'gte', value: 100 },
          { type: 'opponent_state', operator: 'equals', value: 'gassed' },
        ],
      })
    );
    
    // Archetype-specific finishers (tier 3+)
    if (tier >= 3) {
      switch (archetype) {
        case 'striker':
          finishers.push(
            this.createCard({
              name: 'Lightning Rush',
              type: 'finisher',
              baseDamage: 80,
              staminaCost: 6,
              speedModifier: 0.7,
              description: 'Speed-based finisher. Multiple rapid strikes.',
              requirements: [
                { type: 'special_meter', operator: 'gte', value: 100 },
                { type: 'speed', operator: 'gte', value: 70 },
              ],
            })
          );
          break;
        
        case 'grappler':
          finishers.push(
            this.createCard({
              name: 'Ground and Pound Finish',
              type: 'finisher',
              baseDamage: 90,
              staminaCost: 6,
              speedModifier: 0.6,
              description: 'Grappler finisher. Cannot be defended.',
              requirements: [
                { type: 'special_meter', operator: 'gte', value: 100 },
                { type: 'opponent_state', operator: 'equals', value: 'exhausted' },
              ],
            })
          );
          break;
        
        case 'technical':
          finishers.push(
            this.createCard({
              name: 'Perfect Execution',
              type: 'finisher',
              baseDamage: 85,
              staminaCost: 5,
              speedModifier: 0.8,
              description: 'Technical finisher. INT-based damage.',
              requirements: [
                { type: 'special_meter', operator: 'gte', value: 100 },
                { type: 'intelligence', operator: 'gte', value: 70 },
              ],
            })
          );
          break;
      }
    }
    
    return finishers;
  }
  
  // ============================================================================
  // Special Cards (unlocked by Sync level)
  // ============================================================================
  
  private static getSpecialCards(archetype: FighterArchetype, syncLevel: number): ActionCard[] {
    const specials: ActionCard[] = [];
    
    if (syncLevel >= 50) {
      switch (archetype) {
        case 'striker':
          specials.push(
            this.createCard({
              name: 'Blitz Mode',
              type: 'special',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.5,
              description: '+30% speed for 3 turns.',
              effects: [{ type: 'status', target: 'self', value: 30, duration: 3 }],
            })
          );
          break;
        
        case 'technical':
          specials.push(
            this.createCard({
              name: 'Read and React',
              type: 'special',
              baseDamage: 0,
              staminaCost: 2,
              speedModifier: 1.3,
              description: 'See opponent\'s next card.',
              effects: [{ type: 'counter_window', target: 'self', value: 2000 }],
            })
          );
          break;
      }
    }
    
    return specials;
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private static createCard(params: {
    name: string;
    type: 'strike' | 'defense' | 'combo' | 'finisher' | 'special';
    baseDamage: number;
    staminaCost: number;
    speedModifier: number;
    description: string;
    requirements?: any[];
    effects?: any[];
  }): ActionCard {
    return {
      id: generateUUID(),
      templateId: params.name.toLowerCase().replace(/\s+/g, '_'),
      name: params.name,
      type: params.type,
      rarity: 'common',
      
      staminaCost: params.staminaCost,
      requirements: params.requirements || [],
      
      baseDamage: params.baseDamage,
      speedModifier: params.speedModifier,
      effects: params.effects || [],
      
      animationId: params.name.toLowerCase().replace(/\s+/g, '_') + '_animation',
      description: params.description,
      
      canPlay: true,
    };
  }
  
  private static calculateAverageStaminaCost(cards: ActionCard[]): number {
    if (cards.length === 0) return 0;
    const total = cards.reduce((sum, card) => sum + card.staminaCost, 0);
    return Math.round((total / cards.length) * 10) / 10;
  }
  
  private static calculateAverageDamage(cards: ActionCard[]): number {
    if (cards.length === 0) return 0;
    const total = cards.reduce((sum, card) => sum + card.baseDamage, 0);
    return Math.round((total / cards.length) * 10) / 10;
  }
  
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
