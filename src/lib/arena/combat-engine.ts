// ============================================================================
// Arena V2 Combat Engine
// Core combat mechanics: damage, stamina, defense, combos, finishers
// ============================================================================

import type {
  ArenaFighter,
  BattleState,
  BattleAction,
  ActionCard,
  DefenseOutcome,
  StaminaState,
  DamageResult,
  DamageModifier,
  ArenaBattleConfig,
  StatusEffect,
  BattleRewards,
} from '@/types/arena';

import {
  getStaminaState,
  getStaminaModifier,
  SPECIAL_METER_MAX,
  TEMPO_RESET_DELAY_MS,
} from '@/types/arena';

import { generateUUID } from '@/utils/uuid';

// ============================================================================
// Combat Engine Class
// ============================================================================

export class ArenaCombatEngine {
  
  // ============================================================================
  // Battle Initialization
  // ============================================================================
  
  static initializeBattle(
    player: ArenaFighter,
    opponent: ArenaFighter,
    playerCardPool: any, // CardPool type
    opponentCardPool: any, // CardPool type
    config: ArenaBattleConfig,
    opponentLineup: string[] = [],
    currentRound: number = 1
  ): BattleState {
    const now = Date.now();
    
    // Initialize stamina states
    player.staminaState = getStaminaState(player.stamina);
    opponent.staminaState = getStaminaState(opponent.stamina);
    
    // Initialize last stamina regen time
    player.lastActionTime = now;
    opponent.lastActionTime = now;
    
    return {
      battleId: config.playerHolobotId + '-vs-' + (config.opponentHolobotId || 'ai') + '-' + now,
      battleType: config.battleType,
      status: 'active',
      
      player,
      opponent,
      
      playerCardPool,
      opponentCardPool,
      
      // Multi-round state
      currentRound,
      totalRounds: opponentLineup.length || 3,
      opponentLineup,
      roundsWon: 0,
      
      turnNumber: 0,
      currentActorId: player.holobotId, // Keep for compatibility but not used for turn restrictions
      
      pendingActions: [],
      actionHistory: [],
      
      timer: 0,
      lastActionTimestamp: now,
      neutralPhase: false,
      counterWindowOpen: false,
      
      playerBattleStyle: 'balanced',
      hackUsed: false,
      allowPlayerControl: config.allowPlayerControl,
      
      config,
      
      potentialRewards: this.calculatePotentialRewards(player, opponent, config),
      
      createdAt: now,
      startedAt: now,
    };
  }
  
  // ============================================================================
  // Real-Time Stamina Regeneration
  // ============================================================================
  
  static regenerateStamina(state: BattleState): BattleState {
    const now = Date.now();
    const newState = { ...state };
    
    // Stamina regeneration rate (1 stamina per 2 seconds - faster for more action!)
    const STAMINA_REGEN_MS = 2000;
    
    // Regenerate player stamina
    if (newState.player.stamina < newState.player.maxStamina) {
      const timeSinceLastAction = now - newState.player.lastActionTime;
      const staminaToRegen = Math.floor(timeSinceLastAction / STAMINA_REGEN_MS);
      
      if (staminaToRegen > 0) {
        newState.player.stamina = Math.min(
          newState.player.maxStamina,
          newState.player.stamina + staminaToRegen
        );
        // Only update lastActionTime by the amount we actually used
        newState.player.lastActionTime = newState.player.lastActionTime + (staminaToRegen * STAMINA_REGEN_MS);
        newState.player.staminaState = getStaminaState(newState.player.stamina);
      }
    }
    
    // Regenerate opponent stamina  
    if (newState.opponent.stamina < newState.opponent.maxStamina) {
      const timeSinceLastAction = now - newState.opponent.lastActionTime;
      const staminaToRegen = Math.floor(timeSinceLastAction / STAMINA_REGEN_MS);
      
      if (staminaToRegen > 0) {
        newState.opponent.stamina = Math.min(
          newState.opponent.maxStamina,
          newState.opponent.stamina + staminaToRegen
        );
        // Only update lastActionTime by the amount we actually used
        newState.opponent.lastActionTime = newState.opponent.lastActionTime + (staminaToRegen * STAMINA_REGEN_MS);
        newState.opponent.staminaState = getStaminaState(newState.opponent.stamina);
      }
    }
    
    return newState;
  }
  
  // ============================================================================
  // Card Management
  // ============================================================================
  
  static drawCardFromPool(cardPool: any, fighter?: any): any | null {
    // Get all available cards from the pool
    const allCards = [
      ...cardPool.strikeCards,
      ...cardPool.defenseCards,
      ...cardPool.comboCards,
    ];
    
    // If fighter has 100% special meter and no finisher in hand, give them a finisher!
    if (fighter && fighter.specialMeter >= 100) {
      const hasFinisher = fighter.hand?.some((card: any) => card.type === 'finisher');
      if (!hasFinisher && cardPool.finisherCards && cardPool.finisherCards.length > 0) {
        const finisherCard = cardPool.finisherCards[0];
        return {
          ...finisherCard,
          id: generateUUID(),
        };
      }
    }
    
    if (allCards.length === 0) return null;
    
    // Pick a random card
    const randomIndex = Math.floor(Math.random() * allCards.length);
    const baseCard = allCards[randomIndex];
    
    // Create a new instance with unique ID
    return {
      ...baseCard,
      id: generateUUID(), // Give it a new unique ID
    };
  }
  
  // ============================================================================
  // Action Resolution
  // ============================================================================
  
  static resolveAction(
    state: BattleState,
    card: ActionCard,
    actorId: string
  ): BattleState {
    const newState = { ...state };
    const now = Date.now();
    
    // Determine actor and target
    const isPlayerAction = actorId === state.player.holobotId;
    const actor = isPlayerAction ? newState.player : newState.opponent;
    const target = isPlayerAction ? newState.opponent : newState.player;
    
    // Check if action is legal
    if (!this.canPlayCard(card, actor, newState)) {
      console.warn('Illegal action attempted:', card.name);
      return state;
    }
    
    // Create battle action
    const action: BattleAction = {
      id: generateUUID(),
      battleId: state.battleId,
      turnNumber: state.turnNumber,
      actionOrder: state.actionHistory.filter(a => a.turnNumber === state.turnNumber).length,
      
      actorId: actor.holobotId,
      actorRole: isPlayerAction ? 'player' : 'opponent',
      targetId: target.holobotId,
      
      card,
      actionType: card.type,
      
      timestamp: now,
      elapsedMs: now - state.createdAt,
      
      outcome: 'hit', // will be updated below
      damageDealt: 0,
      actualDamage: 0,
      staminaChange: -card.staminaCost,
      specialMeterChange: 0,
      
      wasCountered: false,
      triggeredCombo: false,
      perfectDefense: false,
      openedCounterWindow: false,
      
      animationId: card.animationId,
      animationDuration: 800, // default
    };
    
    // Consume stamina
    actor.stamina = Math.max(0, actor.stamina - card.staminaCost);
    actor.staminaState = getStaminaState(actor.stamina);
    
    // Remove played card from hand and draw a new one
    const cardIndex = actor.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      actor.hand.splice(cardIndex, 1);
      
      // Draw a new card from the pool (pass actor to check for finisher eligibility)
      const cardPool = isPlayerAction ? newState.playerCardPool : newState.opponentCardPool;
      const newCard = this.drawCardFromPool(cardPool, actor);
      if (newCard) {
        actor.hand.push(newCard);
      }
    }
    
    // Exit defense mode when playing any offensive card
    if (card.type !== 'defense') {
      actor.isInDefenseMode = false;
    }
    
    // Handle different card types
    switch (card.type) {
      case 'strike':
        this.resolveStrike(action, actor, target, newState);
        break;
      case 'defense':
        this.resolveDefense(action, actor, target, newState);
        break;
      case 'combo':
        this.resolveCombo(action, actor, target, newState);
        break;
      case 'finisher':
        this.resolveFinisher(action, actor, target, newState);
        break;
      case 'special':
        this.resolveSpecial(action, actor, target, newState);
        break;
    }
    
    // Apply card effects
    this.applyCardEffects(card, actor, target, action);
    
    // Update last action time
    newState.lastActionTimestamp = now;
    actor.lastActionTime = now;
    
    // Add to history
    newState.actionHistory.push(action);
    
    // Check win condition
    const winCondition = this.checkWinCondition(newState);
    if (winCondition.isComplete) {
      newState.status = 'completed';
      newState.completedAt = now;
      // Winner and rewards will be calculated separately
    }
    
    // Increment action counter (no longer turn-based)
    newState.turnNumber++;
    
    // Check for tempo reset
    if (this.shouldTriggerTempoReset(newState)) {
      this.applyTempoReset(newState);
    }
    
    // Update fighters in state
    if (isPlayerAction) {
      newState.player = actor;
      newState.opponent = target;
    } else {
      newState.player = target;
      newState.opponent = actor;
    }
    
    return newState;
  }
  
  // ============================================================================
  // Strike Resolution
  // ============================================================================
  
  private static resolveStrike(
    action: BattleAction,
    attacker: ArenaFighter,
    defender: ArenaFighter,
    state: BattleState
  ): void {
    // Check if defender is in defense mode
    if (defender.isInDefenseMode) {
      // Defense blocks or reduces damage
      action.outcome = 'blocked';
      action.damageDealt = Math.floor(action.card.baseDamage * 0.3); // 70% reduction
      action.actualDamage = action.damageDealt;
    } else {
      // Calculate full damage
      const damageResult = this.calculateDamage(attacker, defender, action.card, false, action.comboLength || 0);
      action.damageDealt = damageResult.rawDamage;
      action.actualDamage = damageResult.finalDamage;
      action.outcome = 'hit';
    }
    
    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - action.actualDamage);
    
    // Build special meter (increased to 1.5x for faster charging)
    const meterGain = Math.floor(action.actualDamage * 1.5);
    action.specialMeterChange = meterGain;
    attacker.specialMeter = Math.min(SPECIAL_METER_MAX, attacker.specialMeter + meterGain);
    
    // Defender also gains meter when hit (0.5x damage taken)
    const defenderMeterGain = Math.floor(action.actualDamage * 0.5);
    defender.specialMeter = Math.min(SPECIAL_METER_MAX, defender.specialMeter + defenderMeterGain);
    
    // Update combo counter
    if (action.outcome === 'hit' && !defender.isInDefenseMode) {
      attacker.comboCounter++;
    } else {
      attacker.comboCounter = 0;
    }
    
    // Stats
    attacker.totalDamageDealt += action.actualDamage;
  }
  
  // ============================================================================
  // Defense Resolution
  // ============================================================================
  
  private static resolveDefense(
    action: BattleAction,
    defender: ArenaFighter,
    attacker: ArenaFighter,
    state: BattleState
  ): void {
    // Defense mode is temporary - exit it immediately after this action
    // (The mode was used to allow this defense card to be played)
    defender.isInDefenseMode = false;
    
    // ALL defense cards restore stamina (2-3 stamina)
    const baseStaminaRestore = 2;
    
    // Check if this was a perfect defense (timing-based)
    // For now, simulate with a probability based on intelligence
    const perfectDefenseChance = defender.intelligence / 200; // 0-0.5 range
    const isPerfect = Math.random() < perfectDefenseChance;
    
    if (isPerfect) {
      action.outcome = 'perfect_defense';
      action.perfectDefense = true;
      
      // Perfect defense restores MORE stamina (3 instead of 2)
      defender.stamina = Math.min(defender.maxStamina, defender.stamina + baseStaminaRestore + 1);
      action.staminaChange = -action.card.staminaCost + baseStaminaRestore + 1;
      
      // Perfect defense gives MORE special meter (15)
      const perfectMeterGain = 15;
      action.specialMeterChange = perfectMeterGain;
      defender.specialMeter = Math.min(SPECIAL_METER_MAX, defender.specialMeter + perfectMeterGain);
      
      // Open counter window for certain defense cards
      if (action.card.name === 'Slip' || action.card.name === 'Parry' || action.card.name === 'Counter Stance') {
        state.counterWindowOpen = true;
        state.counterWindowTarget = defender.holobotId;
        state.counterWindowEndsAt = Date.now() + defender.defenseTimingWindow;
        action.openedCounterWindow = true;
      }
      
      // Stats
      defender.perfectDefenses++;
    } else {
      action.outcome = 'blocked';
      
      // Normal defense still restores stamina (2) and gives some meter (8)
      defender.stamina = Math.min(defender.maxStamina, defender.stamina + baseStaminaRestore);
      action.staminaChange = -action.card.staminaCost + baseStaminaRestore;
      
      const normalMeterGain = 8;
      action.specialMeterChange = normalMeterGain;
      defender.specialMeter = Math.min(SPECIAL_METER_MAX, defender.specialMeter + normalMeterGain);
    }
    
    // Update stamina state
    defender.staminaState = getStaminaState(defender.stamina);
  }
  
  // ============================================================================
  // Combo Resolution
  // ============================================================================
  
  private static resolveCombo(
    action: BattleAction,
    attacker: ArenaFighter,
    defender: ArenaFighter,
    state: BattleState
  ): void {
    // Combo cards deal damage with a multiplier
    const comboMultiplier = this.calculateComboMultiplier(attacker.comboCounter);
    const damageResult = this.calculateDamage(attacker, defender, action.card, false, attacker.comboCounter);
    
    action.damageDealt = Math.floor(damageResult.rawDamage * comboMultiplier);
    action.actualDamage = Math.floor(damageResult.finalDamage * comboMultiplier);
    action.outcome = 'hit';
    action.triggeredCombo = true;
    action.comboLength = attacker.comboCounter + 1;
    
    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - action.actualDamage);
    
    // Build special meter (combos give more meter - increased to 2.0x)
    const meterGain = Math.floor(action.actualDamage * 2.0);
    action.specialMeterChange = meterGain;
    attacker.specialMeter = Math.min(SPECIAL_METER_MAX, attacker.specialMeter + meterGain);
    
    // Defender also gains meter when hit by combo
    const defenderMeterGain = Math.floor(action.actualDamage * 0.8);
    defender.specialMeter = Math.min(SPECIAL_METER_MAX, defender.specialMeter + defenderMeterGain);
    
    // Reset combo counter
    attacker.comboCounter = 0;
    
    // Stats
    attacker.combosCompleted++;
    attacker.totalDamageDealt += action.actualDamage;
  }
  
  // ============================================================================
  // Finisher Resolution
  // ============================================================================
  
  private static resolveFinisher(
    action: BattleAction,
    attacker: ArenaFighter,
    defender: ArenaFighter,
    state: BattleState
  ): void {
    // Finishers deal massive damage and cannot be blocked
    const damageResult = this.calculateDamage(attacker, defender, action.card, false, 0);
    
    action.damageDealt = damageResult.rawDamage * 2; // Double damage for finishers
    action.actualDamage = action.damageDealt; // Ignores defense
    action.outcome = 'hit';
    
    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - action.actualDamage);
    
    // Consume special meter
    attacker.specialMeter = 0;
    
    // Stats
    attacker.totalDamageDealt += action.actualDamage;
  }
  
  // ============================================================================
  // Special Action Resolution
  // ============================================================================
  
  private static resolveSpecial(
    action: BattleAction,
    actor: ArenaFighter,
    target: ArenaFighter,
    state: BattleState
  ): void {
    // Special cards have unique effects defined in card.effects
    // Handle them via applyCardEffects
    action.outcome = 'hit';
  }
  
  // ============================================================================
  // Damage Calculation
  // ============================================================================
  
  static calculateDamage(
    attacker: ArenaFighter,
    defender: ArenaFighter,
    card: ActionCard,
    isCounter: boolean = false,
    comboLength: number = 0
  ): DamageResult {
    const modifiers: DamageModifier[] = [];
    
    // Base damage from card
    let damage = card.baseDamage;
    
    // Apply attack stat bonus
    const attackBonus = attacker.attack * 0.1;
    damage += attackBonus;
    modifiers.push({
      source: 'Attack Stat',
      type: 'add',
      value: attackBonus,
      description: `+${attackBonus.toFixed(1)} from ${attacker.attack} ATK`,
    });
    
    // Apply stamina state modifier
    const staminaModifier = getStaminaModifier(attacker.staminaState);
    if (staminaModifier !== 1.0) {
      damage *= staminaModifier;
      modifiers.push({
        source: 'Stamina State',
        type: 'multiply',
        value: staminaModifier,
        description: `×${staminaModifier} (${attacker.staminaState})`,
      });
    }
    
    // Apply counter bonus
    if (isCounter) {
      const counterBonus = attacker.counterDamageBonus;
      damage *= counterBonus;
      modifiers.push({
        source: 'Counter Strike',
        type: 'multiply',
        value: counterBonus,
        description: `×${counterBonus} counter bonus`,
      });
    }
    
    // Apply combo bonus
    if (comboLength > 0) {
      const comboBonus = 1 + (comboLength * 0.1); // +10% per combo hit
      damage *= comboBonus;
      modifiers.push({
        source: 'Combo',
        type: 'multiply',
        value: comboBonus,
        description: `×${comboBonus.toFixed(2)} (${comboLength}-hit combo)`,
      });
    }
    
    // Apply damage multiplier (from buffs/debuffs)
    if (attacker.damageMultiplier !== 1.0) {
      damage *= attacker.damageMultiplier;
      modifiers.push({
        source: 'Damage Buff',
        type: 'multiply',
        value: attacker.damageMultiplier,
        description: `×${attacker.damageMultiplier} from status effects`,
      });
    }
    
    const rawDamage = Math.floor(damage);
    
    // Apply defense reduction
    const defenseReduction = defender.defense * 0.05;
    const finalDamage = Math.max(1, Math.floor(rawDamage - defenseReduction));
    
    modifiers.push({
      source: 'Defense Stat',
      type: 'subtract',
      value: defenseReduction,
      description: `-${defenseReduction.toFixed(1)} from ${defender.defense} DEF`,
    });
    
    return {
      rawDamage,
      finalDamage,
      damageReduction: rawDamage - finalDamage,
      isCritical: false, // TODO: implement crit system
      modifiers,
    };
  }
  
  // ============================================================================
  // Card Effects Application
  // ============================================================================
  
  private static applyCardEffects(
    card: ActionCard,
    actor: ArenaFighter,
    target: ArenaFighter,
    action: BattleAction
  ): void {
    for (const effect of card.effects) {
      const effectTarget = effect.target === 'self' ? actor : target;
      
      switch (effect.type) {
        case 'damage':
          effectTarget.currentHP = Math.max(0, effectTarget.currentHP - effect.value);
          break;
          
        case 'heal':
          effectTarget.currentHP = Math.min(effectTarget.maxHP, effectTarget.currentHP + effect.value);
          break;
          
        case 'stamina_gain':
          effectTarget.stamina = Math.min(effectTarget.maxStamina, effectTarget.stamina + effect.value);
          effectTarget.staminaState = getStaminaState(effectTarget.stamina);
          break;
          
        case 'stamina_drain':
          effectTarget.stamina = Math.max(0, effectTarget.stamina - effect.value);
          effectTarget.staminaState = getStaminaState(effectTarget.stamina);
          break;
          
        case 'special_meter':
          effectTarget.specialMeter = Math.min(SPECIAL_METER_MAX, effectTarget.specialMeter + effect.value);
          break;
          
        case 'status':
          // Apply status effect
          const statusEffect: StatusEffect = {
            id: generateUUID(),
            type: 'damage_over_time', // default, would need more logic here
            value: effect.value,
            duration: effect.duration || 1,
            appliedBy: card.name,
          };
          effectTarget.statusEffects.push(statusEffect);
          break;
          
        case 'card_draw':
          // Would need card pool system implemented
          break;
      }
    }
  }
  
  // ============================================================================
  // Stamina Management
  // ============================================================================
  
  static consumeStamina(fighter: ArenaFighter, cost: number): void {
    fighter.stamina = Math.max(0, fighter.stamina - cost);
    fighter.staminaState = getStaminaState(fighter.stamina);
  }
  
  static recoverStamina(
    fighter: ArenaFighter,
    amount: number = 1
  ): void {
    fighter.stamina = Math.min(fighter.maxStamina, fighter.stamina + amount);
    fighter.staminaState = getStaminaState(fighter.stamina);
  }
  
  private static shouldTriggerTempoReset(state: BattleState): boolean {
    const now = Date.now();
    const timeSinceLastAction = now - state.lastActionTimestamp;
    return timeSinceLastAction >= TEMPO_RESET_DELAY_MS && !state.neutralPhase;
  }
  
  private static applyTempoReset(state: BattleState): void {
    // Both fighters recover stamina
    this.recoverStamina(state.player, 1);
    this.recoverStamina(state.opponent, 1);
    
    // Reset states
    state.player.comboCounter = 0;
    state.opponent.comboCounter = 0;
    state.player.isInDefenseMode = false;
    state.opponent.isInDefenseMode = false;
    state.neutralPhase = true;
    state.counterWindowOpen = false;
    
    console.log('Tempo reset triggered - both fighters recover stamina');
  }
  
  // ============================================================================
  // Combo System
  // ============================================================================
  
  private static calculateComboMultiplier(comboLength: number): number {
    // Diminishing returns after 5 hits
    if (comboLength === 0) return 1.0;
    if (comboLength <= 3) return 1.0 + (comboLength * 0.15); // +15% per hit
    if (comboLength <= 5) return 1.0 + (comboLength * 0.12); // +12% per hit
    return 1.0 + (comboLength * 0.08); // +8% per hit (diminishing)
  }
  
  // ============================================================================
  // Finisher System
  // ============================================================================
  
  static canUseFinisher(
    attacker: ArenaFighter,
    defender: ArenaFighter
  ): boolean {
    // Check special meter is full
    if (attacker.specialMeter < SPECIAL_METER_MAX) {
      console.log('[Finisher] Not ready - special meter:', attacker.specialMeter);
      return false;
    }
    
    // Check attacker has enough stamina (minimum 3, finishers usually cost 4-6)
    if (attacker.stamina < 3) {
      console.log('[Finisher] Not enough stamina:', attacker.stamina);
      return false;
    }
    
    console.log('[Finisher] Ready to use!');
    return true;
  }
  
  // ============================================================================
  // Card Validation
  // ============================================================================
  
  private static canPlayCard(
    card: ActionCard,
    fighter: ArenaFighter,
    state: BattleState
  ): boolean {
    // Check stamina cost
    if (fighter.stamina < card.staminaCost) return false;
    
    // Check if in defense mode (can only play defense cards)
    if (fighter.isInDefenseMode && card.type !== 'defense') return false;
    
    // Check exhausted state (no combos or finishers)
    if (fighter.staminaState === 'exhausted' && (card.type === 'combo' || card.type === 'finisher')) {
      return false;
    }
    
    // Check finisher requirements
    if (card.type === 'finisher') {
      const target = fighter.holobotId === state.player.holobotId ? state.opponent : state.player;
      if (!this.canUseFinisher(fighter, target)) return false;
    }
    
    return true;
  }
  
  // ============================================================================
  // Turn Management
  // ============================================================================
  
  private static getNextActor(state: BattleState): string {
    // Simple alternating turns
    // In a real implementation, this would be speed-based
    return state.currentActorId === state.player.holobotId 
      ? state.opponent.holobotId 
      : state.player.holobotId;
  }
  
  // ============================================================================
  // Win Conditions
  // ============================================================================
  
  static checkWinCondition(state: BattleState): {
    isComplete: boolean;
    winnerId?: string;
    winType?: 'ko' | 'finisher' | 'timeout' | 'forfeit';
  } {
    // Check HP
    if (state.player.currentHP <= 0) {
      return {
        isComplete: true,
        winnerId: state.opponent.holobotId,
        winType: 'ko',
      };
    }
    
    if (state.opponent.currentHP <= 0) {
      return {
        isComplete: true,
        winnerId: state.player.holobotId,
        winType: 'ko',
      };
    }
    
    // Check turn limit
    if (state.config.maxTurns && state.turnNumber >= state.config.maxTurns) {
      // Winner is who has more HP
      const winnerId = state.player.currentHP > state.opponent.currentHP 
        ? state.player.holobotId 
        : state.opponent.holobotId;
      
      return {
        isComplete: true,
        winnerId,
        winType: 'timeout',
      };
    }
    
    // Check if finisher was just used
    const lastAction = state.actionHistory[state.actionHistory.length - 1];
    if (lastAction && lastAction.actionType === 'finisher' && lastAction.outcome === 'hit') {
      return {
        isComplete: true,
        winnerId: lastAction.actorId,
        winType: 'finisher',
      };
    }
    
    return { isComplete: false };
  }
  
  // ============================================================================
  // Rewards
  // ============================================================================
  
  private static calculatePotentialRewards(
    player: ArenaFighter,
    opponent: ArenaFighter,
    config: ArenaBattleConfig
  ): BattleRewards {
    // Get tier from config (default to 1)
    const tier = (config as any).tier || 1;
    
    // Base rewards depend on tier
    let baseExp = 100;
    let baseSyncPoints = 50;
    let baseArenaTokens = 10;
    let gachaTickets = 0;
    let boosterPackTickets = 0;
    let holos = 0;
    
    switch (tier) {
      case 1: // Tutorial/Beginner
        baseExp = 100;
        baseSyncPoints = 50;
        baseArenaTokens = 10;
        gachaTickets = 1;
        boosterPackTickets = 1;
        break;
      case 2: // Intermediate  
        baseExp = 150;
        baseSyncPoints = 75;
        baseArenaTokens = 15;
        gachaTickets = 2;
        boosterPackTickets = 2;
        break;
      case 3: // Advanced - HOLOS rewards!
        baseExp = 200;
        baseSyncPoints = 100;
        baseArenaTokens = 25;
        gachaTickets = 3;
        boosterPackTickets = 3;
        holos = 150; // Only Tier 3 gives HOLOS!
        break;
      default:
        baseExp = 100;
        baseSyncPoints = 50;
        baseArenaTokens = 10;
        gachaTickets = 1;
        boosterPackTickets = 1;
    }
    
    return {
      exp: baseExp,
      syncPoints: baseSyncPoints,
      arenaTokens: baseArenaTokens,
      gachaTickets,
      boosterPackTickets,
      holos,
      opponentName: opponent.name,
    };
  }
  
  static calculateFinalRewards(
    state: BattleState,
    winnerId: string,
    winType: 'ko' | 'finisher' | 'timeout' | 'forfeit'
  ): BattleRewards {
    const rewards = { ...state.potentialRewards };
    const isPlayerWin = winnerId === state.player.holobotId;
    
    // Only give rewards if player won
    if (!isPlayerWin) {
      // Player lost - give minimal consolation rewards
      return {
        exp: Math.floor((rewards.exp || 0) * 0.3),
        syncPoints: Math.floor((rewards.syncPoints || 0) * 0.3),
        arenaTokens: Math.floor((rewards.arenaTokens || 0) * 0.3),
      };
    }
    
    // Add blueprint rewards for ALL opponents in the lineup (if won all rounds)
    const tier = (state.config as any).tier || 1;
    
    // Blueprint amounts scale with tier difficulty
    const blueprintAmounts: Record<number, number> = {
      0: 5,  // Tutorial: 5 pieces each
      1: 5,  // Tier 1: 5 pieces each
      2: 10, // Tier 2: 10 pieces each
      3: 15, // Tier 3: 15 pieces each
    };
    const blueprintAmount = blueprintAmounts[tier] || 5;
    
    if (state.opponentLineup && state.opponentLineup.length > 0) {
      rewards.blueprintRewards = state.opponentLineup.map(opponentKey => ({
        holobotKey: opponentKey.toLowerCase(),
        amount: blueprintAmount,
      }));
      
      console.log(`[Rewards] Blueprint rewards (Tier ${tier}):`, rewards.blueprintRewards);
    }
    const winner = winnerId === state.player.holobotId ? state.player : state.opponent;
    
    // Perfect defense bonus
    if (winner.perfectDefenses > 0) {
      rewards.perfectDefenseBonus = winner.perfectDefenses * 20;
      rewards.exp = (rewards.exp || 0) + rewards.perfectDefenseBonus;
    }
    
    // Combo bonus
    if (winner.combosCompleted > 0) {
      rewards.comboBonus = winner.combosCompleted * 30;
      rewards.exp = (rewards.exp || 0) + rewards.comboBonus;
    }
    
    // Finisher bonus
    if (winType === 'finisher') {
      rewards.exp = (rewards.exp || 0) * 1.5;
      rewards.syncPoints = (rewards.syncPoints || 0) * 1.5;
    }
    
    // Speed bonus (fast victories)
    if (state.turnNumber < 10) {
      rewards.speedBonus = Math.floor((10 - state.turnNumber) * 10);
      rewards.exp = (rewards.exp || 0) + rewards.speedBonus;
    }
    
    return rewards;
  }
}
