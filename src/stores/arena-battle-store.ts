// ============================================================================
// Arena V2 Battle Store (Zustand)
// Global state management for active battles
// ============================================================================

import { create } from 'zustand';
import type {
  BattleState,
  BattleAction,
  ActionCard,
  ArenaFighter,
  ArenaBattleConfig,
  ArenaBattleUIState,
} from '@/types/arena';

import { ArenaCombatEngine } from '@/lib/arena/combat-engine';
import { ArenaAI } from '@/lib/arena/ai-controller';
import { CardPoolGenerator } from '@/lib/arena/card-generator';
import { generateUUID } from '@/utils/uuid';

// ============================================================================
// Store Interface
// ============================================================================

interface ArenaBattleStore {
  // Current Battle State
  currentBattle: BattleState | null;
  isLoading: boolean;
  error: string | null;
  
  // UI State
  uiState: ArenaBattleUIState;
  
  // AI Controller
  aiController: ArenaAI | null;
  
  // Auto-Battle State
  isAutoBattleRunning: boolean;
  autoBattleIntervalId: number | null;
  
  // Real-Time Game Loop
  gameLoopIntervalId: number | null;
  lastAIActionTime: number;
  startGameLoop: () => void;
  stopGameLoop: () => void;
  
  // Multi-Round State
  arenaConfig: ArenaBattleConfig | null;
  playerFighterData: any; // Store player data for next rounds
  
  // Actions - Battle Management
  initializeBattle: (config: ArenaBattleConfig, playerFighter: ArenaFighter, opponentFighter: ArenaFighter, opponentLineup?: string[]) => Promise<void>;
  endRound: (winnerId: string) => Promise<void>;
  startNextRound: (roundNumber: number, opponentKey: string, roundsWon: number) => Promise<void>;
  endArena: () => Promise<void>;
  distributeRewards: (rewards: any, userId: string) => Promise<void>;
  abandonBattle: () => void;
  pauseBattle: () => void;
  resumeBattle: () => void;
  
  // Actions - Gameplay
  playCard: (cardId: string) => void;
  enterDefenseMode: () => void;
  useHack: () => void;
  useSpecialAttack: () => void;
  
  // Actions - Auto-Battle
  startAutoBattle: () => void;
  stopAutoBattle: () => void;
  processAITurn: () => void;
  
  // Actions - UI
  setSelectedCard: (cardId: string | null) => void;
  setHoveredCard: (cardId: string | null) => void;
  toggleDefensePrompt: (show: boolean) => void;
  addAnimationToQueue: (animationId: string) => void;
  
  // Getters
  getAvailableCards: () => ActionCard[];
  canPlayCard: (cardId: string) => boolean;
  getCurrentFighter: () => ArenaFighter | null;
  getOpponentFighter: () => ArenaFighter | null;
  
  // Internal
  _updateBattleState: (updater: (state: BattleState) => BattleState) => void;
  _setBattle: (battle: BattleState | null) => void;
}

// ============================================================================
// Initial UI State
// ============================================================================

const initialUIState: ArenaBattleUIState = {
  selectedCardId: null,
  hoveredCardId: null,
  showDefensePrompt: false,
  showSpecialAttackMenu: false,
  showPauseMenu: false,
  showVictoryScreen: false,
  showDefeatScreen: false,
  isAnimating: false,
  currentAnimationId: null,
  animationQueue: [],
  visibleLogEntries: 10,
  autoScroll: true,
  cameraZoom: 1.0,
  cameraFocus: 'center',
  sfxEnabled: true,
  musicEnabled: true,
  announcerEnabled: true,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useArenaBattleStore = create<ArenaBattleStore>((set, get) => ({
  // Initial State
  currentBattle: null,
  isLoading: false,
  error: null,
  uiState: initialUIState,
  aiController: null,
  isAutoBattleRunning: false,
  autoBattleIntervalId: null,
  gameLoopIntervalId: null,
  lastAIActionTime: 0,
  arenaConfig: null,
  playerFighterData: null,
  
  // ============================================================================
  // Battle Management Actions
  // ============================================================================
  
  initializeBattle: async (config, playerFighter, opponentFighter, opponentLineup = []) => {
    set({ isLoading: true, error: null });
    
    try {
      // Store config and player data for multi-round battles
      set({ 
        arenaConfig: config,
        playerFighterData: { ...playerFighter }
      });
      
      // Generate card pools for both fighters
      const playerCardPool = await CardPoolGenerator.generateCardPool({
        holobotId: playerFighter.holobotId,
        archetype: playerFighter.archetype,
        tier: 1,
        equippedParts: [],
        syncLevel: 50,
        unlockedCards: [],
      });
      
      const opponentCardPool = await CardPoolGenerator.generateCardPool({
        holobotId: opponentFighter.holobotId,
        archetype: opponentFighter.archetype,
        tier: 1,
        equippedParts: [],
        syncLevel: 50,
        unlockedCards: [],
      });
      
      // Draw starting hands
      playerFighter.hand = CardPoolGenerator.drawStartingHand(playerCardPool, playerFighter.maxStamina);
      opponentFighter.hand = CardPoolGenerator.drawStartingHand(opponentCardPool, opponentFighter.maxStamina);
      
      console.log('[Battle Init] Round 1/3 - Player hand:', playerFighter.hand.length, 'cards');
      console.log('[Battle Init] Opponent lineup:', opponentLineup);
      
      // Initialize battle state with round info
      const currentRound = 1;
      const battleState = ArenaCombatEngine.initializeBattle(
        playerFighter,
        opponentFighter,
        playerCardPool,
        opponentCardPool,
        config,
        opponentLineup,
        currentRound
      );
      
      // Create AI controller
      const aiDifficulty = config.aiDifficulty || 'medium';
      const aiController = new ArenaAI(aiDifficulty);
      
      set({
        currentBattle: battleState,
        aiController,
        isLoading: false,
        uiState: { ...initialUIState },
      });
      
      // Start real-time game loop
      get().startGameLoop();
      
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize battle',
        isLoading: false,
      });
    }
  },
  
  endRound: async (winnerId) => {
    const battle = get().currentBattle;
    if (!battle) return;
    
    const isPlayerWin = winnerId === battle.player.holobotId;
    console.log('[Round End] Round', battle.currentRound, '/', battle.totalRounds);
    console.log('[Round End] Winner:', isPlayerWin ? 'PLAYER' : 'OPPONENT');
    
    // Stop game loop
    get().stopGameLoop();
    get().stopAutoBattle();
    
    // If player lost, end the entire arena run
    if (!isPlayerWin) {
      console.log('[Round End] Player lost - ending arena run');
      await get().endArena();
      return;
    }
    
    // Player won this round
    const newRoundsWon = battle.roundsWon + 1;
    console.log('[Round End] Rounds won:', newRoundsWon, '/', battle.totalRounds);
    
    // Update the battle state with new rounds won
    const updatedBattle = {
      ...battle,
      roundsWon: newRoundsWon,
    };
    set({ currentBattle: updatedBattle });
    
    // Check if this was the final round
    if (battle.currentRound >= battle.totalRounds) {
      console.log('[Round End] Final round complete - player wins arena!');
      await get().endArena();
      return;
    }
    
    // More rounds to go - start next round
    console.log('[Round End] Starting next round...');
    const nextRound = battle.currentRound + 1;
    const nextOpponentKey = battle.opponentLineup[nextRound - 1];
    
    if (!nextOpponentKey) {
      console.error('[Round End] No opponent for next round!');
      await get().endArena();
      return;
    }
    
    // Brief delay then start next round
    setTimeout(async () => {
      await get().startNextRound(nextRound, nextOpponentKey, newRoundsWon);
    }, 2000);
  },
  
  startNextRound: async (roundNumber, opponentKey, roundsWon) => {
    const { arenaConfig, playerFighterData, currentBattle } = get();
    if (!arenaConfig || !playerFighterData || !currentBattle) return;
    
    set({ isLoading: true });
    
    console.log(`[Next Round] Starting Round ${roundNumber}/${currentBattle.totalRounds}`);
    console.log(`[Next Round] Next opponent: ${opponentKey}`);
    
    // Import necessary modules
    const { HOLOBOT_STATS } = await import('@/types/holobot');
    const { getHolobotImagePath } = await import('@/utils/holobotImageUtils');
    
    // Create next opponent
    const opponentStats = HOLOBOT_STATS[opponentKey] || HOLOBOT_STATS['ace'];
    const opponentLevel = (arenaConfig as any).opponentLevel || currentBattle.opponent.level;
    const opponentLevelBonus = 1 + ((opponentLevel - 1) * 0.05);
    
    const nextOpponent: ArenaFighter = {
      ...currentBattle.opponent,
      holobotId: `opponent-${roundNumber}`,
      name: opponentKey.toUpperCase(),
      avatar: getHolobotImagePath(opponentKey),
      level: opponentLevel,
      maxHP: Math.floor((opponentStats.hp || 100) * opponentLevelBonus),
      currentHP: Math.floor((opponentStats.hp || 100) * opponentLevelBonus),
      attack: Math.floor((opponentStats.attack || 55) * opponentLevelBonus),
      defense: Math.floor((opponentStats.defense || 35) * opponentLevelBonus),
      speed: Math.floor((opponentStats.speed || 65) * opponentLevelBonus),
      intelligence: Math.floor((opponentStats.intelligence || 50) * opponentLevelBonus),
      hand: [],
      totalDamageDealt: 0,
      perfectDefenses: 0,
      combosCompleted: 0,
    };
    
    // Restore player to full health for next round
    const restoredPlayer: ArenaFighter = {
      ...currentBattle.player,
      currentHP: currentBattle.player.maxHP,
      stamina: currentBattle.player.maxStamina,
      specialMeter: 0,
      isInDefenseMode: false,
      comboCounter: 0,
      hand: [],
      totalDamageDealt: 0,
    };
    
    // Generate new card pools
    const playerCardPool = await CardPoolGenerator.generateCardPool({
      holobotId: restoredPlayer.holobotId,
      archetype: restoredPlayer.archetype,
      tier: 1,
      equippedParts: [],
      syncLevel: 50,
      unlockedCards: [],
    });
    
    const opponentCardPool = await CardPoolGenerator.generateCardPool({
      holobotId: nextOpponent.holobotId,
      archetype: nextOpponent.archetype,
      tier: 1,
      equippedParts: [],
      syncLevel: 50,
      unlockedCards: [],
    });
    
    // Draw starting hands
    restoredPlayer.hand = CardPoolGenerator.drawStartingHand(playerCardPool, restoredPlayer.maxStamina);
    nextOpponent.hand = CardPoolGenerator.drawStartingHand(opponentCardPool, nextOpponent.maxStamina);
    
    // Create new battle state
    const newBattleState = ArenaCombatEngine.initializeBattle(
      restoredPlayer,
      nextOpponent,
      playerCardPool,
      opponentCardPool,
      arenaConfig,
      currentBattle.opponentLineup,
      roundNumber
    );
    
    // Preserve rounds won
    newBattleState.roundsWon = roundsWon;
    
    set({
      currentBattle: newBattleState,
      isLoading: false,
    });
    
    // Start game loop for new round
    get().startGameLoop();
  },
  
  endArena: async () => {
    const battle = get().currentBattle;
    if (!battle) return;
    
    console.log('[Arena End] Total rounds won:', battle.roundsWon, '/', battle.totalRounds);
    
    const playerWonArena = battle.roundsWon === battle.totalRounds;
    console.log('[Arena End] Player won arena?', playerWonArena);
    
    // Calculate final rewards based on rounds won
    const winType = playerWonArena ? 'ko' : 'forfeit';
    const rewards = ArenaCombatEngine.calculateFinalRewards(battle, battle.player.holobotId, winType);
    
    // Scale rewards by rounds won
    const rewardMultiplier = battle.roundsWon / battle.totalRounds;
    console.log('[Arena End] Reward multiplier:', rewardMultiplier);
    
    if (rewards.exp) rewards.exp = Math.floor(rewards.exp * rewardMultiplier);
    if (rewards.syncPoints) rewards.syncPoints = Math.floor(rewards.syncPoints * rewardMultiplier);
    if (rewards.gachaTickets) rewards.gachaTickets = Math.floor(rewards.gachaTickets * rewardMultiplier);
    if (rewards.boosterPackTickets) rewards.boosterPackTickets = Math.floor(rewards.boosterPackTickets * rewardMultiplier);
    if (rewards.holos) rewards.holos = Math.floor(rewards.holos * rewardMultiplier);
    
    console.log('[Arena End] Final rewards:', rewards);
    
    // Update battle state
    const finalBattle: BattleState = {
      ...battle,
      status: 'completed',
      completedAt: Date.now(),
      potentialRewards: rewards,
    };
    
    set({ 
      currentBattle: finalBattle,
      uiState: {
        ...get().uiState,
        showVictoryScreen: playerWonArena,
        showDefeatScreen: !playerWonArena,
      },
    });
    
    console.log('[Arena End] Showing victory screen:', playerWonArena, 'defeat screen:', !playerWonArena);
    
    // Distribute rewards if player won at least 1 round
    if (battle.roundsWon > 0) {
      await get().distributeRewards(rewards, battle.player.userId);
    }
  },
  
  distributeRewards: async (rewards, userId) => {
    try {
      console.log('[Arena V2 Rewards] ========== STARTING DISTRIBUTION ==========');
      console.log('[Arena V2 Rewards] User ID:', userId);
      console.log('[Arena V2 Rewards] Rewards to distribute:', JSON.stringify(rewards, null, 2));
      
      // Import Firestore
      const { doc, updateDoc, increment, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firestore');
      const { updateHolobotExperience } = await import('@/lib/firebase');
      
      // Calculate updates
      const updates: any = {};
      
      // Add currency rewards
      if (rewards.holos && rewards.holos > 0) {
        updates.holosTokens = increment(rewards.holos);
        console.log('[Arena V2 Rewards] ✓ Adding HOLOS:', rewards.holos);
      }
      
      if (rewards.gachaTickets && rewards.gachaTickets > 0) {
        updates.gachaTickets = increment(rewards.gachaTickets);
        console.log('[Arena V2 Rewards] ✓ Adding gacha tickets:', rewards.gachaTickets);
      }
      
      if (rewards.boosterPackTickets && rewards.boosterPackTickets > 0) {
        updates.arena_passes = increment(rewards.boosterPackTickets);
        console.log('[Arena V2 Rewards] ✓ Adding booster packs:', rewards.boosterPackTickets);
      }
      
      // Get current user data to update blueprints and holobots
      console.log('[Arena V2 Rewards] Fetching user data from Firestore...');
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.error('[Arena V2 Rewards] ❌ User not found in Firestore! userId:', userId);
        return;
      }
      
      const userData = userSnap.data();
      console.log('[Arena V2 Rewards] Current user data loaded');
      console.log('[Arena V2 Rewards] Current holobots:', userData.holobots?.map((h: any) => `${h.name} (${h.experience || 0} XP)`));
      
      // Add blueprint pieces for ALL opponents
      if (rewards.blueprintRewards && rewards.blueprintRewards.length > 0) {
        console.log('[Arena V2 Rewards] Processing', rewards.blueprintRewards.length, 'blueprint rewards...');
        const currentBlueprints = userData.blueprints || {};
        
        for (const blueprint of rewards.blueprintRewards) {
          const holobotKey = blueprint.holobotKey;
          const oldAmount = currentBlueprints[holobotKey] || 0;
          const newAmount = oldAmount + blueprint.amount;
          currentBlueprints[holobotKey] = newAmount;
          
          console.log(`[Arena V2 Rewards] ✓ Blueprint: ${holobotKey} | Old: ${oldAmount} | +${blueprint.amount} | New: ${newAmount}`);
        }
        
        updates.blueprints = currentBlueprints;
        console.log('[Arena V2 Rewards] Final blueprint object:', currentBlueprints);
      } else {
        console.log('[Arena V2 Rewards] ⚠️ No blueprint rewards to distribute');
      }
      
      // Update experience for the holobot - USE THE SAME METHOD AS TRAINING
      if (rewards.exp && userData.holobots && userData.holobots.length > 0) {
        const currentBattle = get().currentBattle;
        const playerHolobotName = currentBattle?.player.name;
        
        if (!playerHolobotName) {
          console.error('[Arena V2 Rewards] ❌ No player holobot name found in battle state!');
        } else {
          console.log('[Arena V2 Rewards] Looking for holobot:', playerHolobotName);
          
          // Find the holobot in the user's collection
          const holobot = userData.holobots.find(
            (h: any) => h.name.toLowerCase() === playerHolobotName.toLowerCase()
          );
          
          if (!holobot) {
            console.error('[Arena V2 Rewards] ❌ Holobot not found in user collection!');
            console.error('[Arena V2 Rewards] Available holobots:', userData.holobots.map((h: any) => h.name));
          } else {
            const currentExperience = holobot.experience || 0;
            const newExperience = currentExperience + Math.floor(rewards.exp);
            const nextLevelExp = holobot.nextLevelExp || 100;
            const currentLevel = holobot.level || 1;
            
            // Calculate new level (same as training)
            let newLevel = currentLevel;
            let tempExp = newExperience;
            let tempNextExp = nextLevelExp;
            
            while (tempExp >= tempNextExp) {
              newLevel += 1;
              tempNextExp = Math.floor(100 * Math.pow(newLevel, 2)); // Base XP formula
            }
            
            console.log('[Arena V2 Rewards] XP Update:', {
              holobot: playerHolobotName,
              currentExp: currentExperience,
              expGained: Math.floor(rewards.exp),
              newExp: newExperience,
              currentLevel,
              newLevel,
              nextLevelExp: tempNextExp
            });
            
            // Use the same helper function as training!
            const updatedHolobots = updateHolobotExperience(
              userData.holobots,
              playerHolobotName,
              newExperience,
              newLevel
            );
            
            updates.holobots = updatedHolobots;
            console.log('[Arena V2 Rewards] ✅ Holobot experience updated using training method!');
          }
        }
      } else {
        console.log('[Arena V2 Rewards] ⚠️ No experience to distribute or no holobots found');
      }
      
      // Apply updates to Firestore
      if (Object.keys(updates).length > 0) {
        console.log('[Rewards] Applying updates to Firestore...');
        console.log('[Rewards] Updates object:', JSON.stringify(updates, null, 2));
        
        await updateDoc(userRef, updates);
        console.log('[Rewards] ✅ Successfully saved to Firebase!');
        
        // Also update the local auth state
        console.log('[Rewards] Refreshing local auth state...');
        const { useAuth } = await import('@/contexts/auth');
        const authStore = (useAuth as any).getState?.();
        if (authStore?.updateUser) {
          // Trigger a refresh of user data
          const refreshedSnap = await getDoc(userRef);
          if (refreshedSnap.exists()) {
            const refreshedData = refreshedSnap.data();
            authStore.user = { ...authStore.user, ...refreshedData };
            console.log('[Rewards] ✅ Local auth state updated!');
          }
        }
        console.log('[Rewards] ========== DISTRIBUTION COMPLETE ==========');
      } else {
        console.log('[Rewards] ⚠️ No updates to apply - updates object is empty!');
      }
    } catch (error) {
      console.error('[Rewards] ❌ FAILED TO DISTRIBUTE:', error);
      console.error('[Rewards] Error details:', error);
    }
  },
  
  abandonBattle: () => {
    get().stopGameLoop();
    get().stopAutoBattle();
    set({
      currentBattle: null,
      uiState: initialUIState,
      aiController: null,
    });
  },
  
  pauseBattle: () => {
    get().stopAutoBattle();
    get()._updateBattleState(state => ({ ...state, status: 'paused' }));
    set({ uiState: { ...get().uiState, showPauseMenu: true } });
  },
  
  resumeBattle: () => {
    get()._updateBattleState(state => ({ ...state, status: 'active' }));
    set({ uiState: { ...get().uiState, showPauseMenu: false } });
    
    // Restart auto-battle if it was running
    const battle = get().currentBattle;
    if (battle && !battle.allowPlayerControl) {
      get().startAutoBattle();
    }
  },
  
  // ============================================================================
  // Gameplay Actions
  // ============================================================================
  
  playCard: (cardId) => {
    const battle = get().currentBattle;
    if (!battle || battle.status !== 'active') return;
    
    // Find the card in player's hand
    const card = battle.player.hand.find(c => c.id === cardId);
    if (!card) {
      console.warn('Card not found in hand:', cardId);
      return;
    }
    
    // Check if player can play card
    if (!get().canPlayCard(cardId)) {
      console.warn('Cannot play card:', card.name);
      return;
    }
    
    // Resolve the action (real-time, no turn checking)
    const newBattleState = ArenaCombatEngine.resolveAction(
      battle,
      card,
      battle.player.holobotId
    );
    
    set({ currentBattle: newBattleState, uiState: { ...get().uiState, selectedCardId: null } });
    
    // Check if round ended
    const winCondition = ArenaCombatEngine.checkWinCondition(newBattleState);
    if (winCondition.isComplete && winCondition.winnerId) {
      get().endRound(winCondition.winnerId);
    }
    // No need to trigger AI turn - game loop handles it continuously
  },
  
  enterDefenseMode: () => {
    const battle = get().currentBattle;
    if (!battle) return;
    
    // Find a defense card in hand
    const defenseCard = battle.player.hand.find(card => card.type === 'defense');
    if (defenseCard) {
      get().playCard(defenseCard.id);
    }
  },
  
  useHack: () => {
    const battle = get().currentBattle;
    if (!battle || battle.hackUsed) return;
    
    // TODO: Implement hack ability
    // For now, just give player +2 stamina and special meter boost
    get()._updateBattleState(state => ({
      ...state,
      hackUsed: true,
      player: {
        ...state.player,
        stamina: Math.min(state.player.maxStamina, state.player.stamina + 2),
        specialMeter: Math.min(100, state.player.specialMeter + 30),
      },
    }));
  },
  
  useSpecialAttack: () => {
    const battle = get().currentBattle;
    if (!battle) return;
    
    console.log('[Special Attack] Player special meter:', battle.player.specialMeter);
    console.log('[Special Attack] Player hand:', battle.player.hand.map(c => c.name));
    
    // Check if can use finisher
    if (!ArenaCombatEngine.canUseFinisher(battle.player, battle.opponent)) {
      console.log('[Special Attack] Cannot use finisher (requirements not met)');
      return;
    }
    
    // Find finisher card in hand
    let finisher = battle.player.hand.find(card => card.type === 'finisher');
    
    // If no finisher in hand but special is ready, draw one from pool
    if (!finisher && battle.playerCardPool.finisherCards && battle.playerCardPool.finisherCards.length > 0) {
      console.log('[Special Attack] No finisher in hand, adding one from pool');
      const finisherCard = battle.playerCardPool.finisherCards[0];
      const newFinisher = {
        ...finisherCard,
        id: generateUUID(),
      };
      
      // Add finisher to hand
      battle.player.hand.push(newFinisher);
      finisher = newFinisher;
      
      set({ currentBattle: battle });
    }
    
    if (finisher) {
      console.log('[Special Attack] Playing finisher:', finisher.name);
      get().playCard(finisher.id);
    } else {
      console.log('[Special Attack] No finisher available');
    }
  },
  
  // ============================================================================
  // Auto-Battle Actions
  // ============================================================================
  
  startAutoBattle: () => {
    // Stop existing auto-battle if running
    get().stopAutoBattle();
    
    // Start auto-battle loop
    const intervalId = window.setInterval(() => {
      get().processAITurn();
    }, 1500); // AI acts every 1.5 seconds
    
    set({ 
      isAutoBattleRunning: true,
      autoBattleIntervalId: intervalId,
    });
  },
  
  stopAutoBattle: () => {
    const { autoBattleIntervalId } = get();
    if (autoBattleIntervalId !== null) {
      clearInterval(autoBattleIntervalId);
    }
    
    set({ 
      isAutoBattleRunning: false,
      autoBattleIntervalId: null,
    });
  },
  
  processAITurn: () => {
    const { currentBattle, aiController } = get();
    if (!currentBattle || !aiController || currentBattle.status !== 'active') return;
    
    // AI always controls the opponent
    const actor = currentBattle.opponent;
    const availableCards = actor.hand;
    
    console.log('[AI] Opponent hand:', availableCards.length, 'cards, stamina:', actor.stamina);
    
    // Get AI decision
    const decision = aiController.selectAction(currentBattle, availableCards, false);
    
    if (!decision.selectedCard) {
      console.log('[AI] No valid card selected. Reason:', decision.reasoning);
      return;
    }
    
    console.log('[AI] Playing card:', decision.selectedCard.name, 'Cost:', decision.selectedCard.staminaCost);
    
    // Execute AI's chosen action
    const newBattleState = ArenaCombatEngine.resolveAction(
      currentBattle,
      decision.selectedCard,
      actor.holobotId
    );
    
    set({ currentBattle: newBattleState });
    
    // Check if round ended
    const winCondition = ArenaCombatEngine.checkWinCondition(newBattleState);
    if (winCondition.isComplete && winCondition.winnerId) {
      get().endRound(winCondition.winnerId);
    }
  },
  
  // ============================================================================
  // Real-Time Game Loop
  // ============================================================================
  
  startGameLoop: () => {
    // Stop existing loop if running
    get().stopGameLoop();
    
    console.log('[Game Loop] Starting real-time game loop');
    
    // Start real-time game loop (runs every 500ms)
    const intervalId = window.setInterval(() => {
      const battle = get().currentBattle;
      if (!battle || battle.status !== 'active') {
        console.log('[Game Loop] Battle not active, stopping loop');
        get().stopGameLoop();
        return;
      }
      
      // 1. Regenerate stamina for both fighters
      const regeneratedState = ArenaCombatEngine.regenerateStamina(battle);
      set({ currentBattle: regeneratedState });
      
      // 2. AI attacks if it has stamina and enough time has passed since last action
      const now = Date.now();
      const timeSinceLastAI = now - get().lastAIActionTime;
      const AI_COOLDOWN_MS = 1000; // 1 second between AI actions
      
      if (regeneratedState.opponent.stamina >= 1 && timeSinceLastAI >= AI_COOLDOWN_MS) {
        console.log('[Game Loop] Opponent has stamina:', regeneratedState.opponent.stamina, '- triggering AI turn');
        set({ lastAIActionTime: now });
        setTimeout(() => get().processAITurn(), 100);
      }
      
    }, 500); // Run every 500ms
    
    set({ gameLoopIntervalId: intervalId });
  },
  
  stopGameLoop: () => {
    const { gameLoopIntervalId } = get();
    if (gameLoopIntervalId !== null) {
      clearInterval(gameLoopIntervalId);
    }
    set({ gameLoopIntervalId: null });
  },
  
  // ============================================================================
  // UI Actions
  // ============================================================================
  
  setSelectedCard: (cardId) => {
    set({ uiState: { ...get().uiState, selectedCardId: cardId } });
  },
  
  setHoveredCard: (cardId) => {
    set({ uiState: { ...get().uiState, hoveredCardId: cardId } });
  },
  
  toggleDefensePrompt: (show) => {
    set({ uiState: { ...get().uiState, showDefensePrompt: show } });
  },
  
  addAnimationToQueue: (animationId) => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        animationQueue: [...uiState.animationQueue, animationId],
      },
    });
  },
  
  // ============================================================================
  // Getters
  // ============================================================================
  
  getAvailableCards: () => {
    const battle = get().currentBattle;
    if (!battle) return [];
    
    return battle.player.hand.filter(card => 
      get().canPlayCard(card.id)
    );
  },
  
  canPlayCard: (cardId) => {
    const battle = get().currentBattle;
    if (!battle) return false;
    
    const card = battle.player.hand.find(c => c.id === cardId);
    if (!card) return false;
    
    // Check stamina
    if (battle.player.stamina < card.staminaCost) return false;
    
    // Check if in defense mode
    if (battle.player.isInDefenseMode && card.type !== 'defense') return false;
    
    // Check exhausted state
    if (battle.player.staminaState === 'exhausted' && 
        (card.type === 'combo' || card.type === 'finisher')) {
      return false;
    }
    
    return true;
  },
  
  getCurrentFighter: () => {
    return get().currentBattle?.player || null;
  },
  
  getOpponentFighter: () => {
    return get().currentBattle?.opponent || null;
  },
  
  // ============================================================================
  // Internal Methods
  // ============================================================================
  
  _updateBattleState: (updater) => {
    const battle = get().currentBattle;
    if (!battle) return;
    
    const newBattle = updater(battle);
    set({ currentBattle: newBattle });
  },
  
  _setBattle: (battle) => {
    set({ currentBattle: battle });
  },
}));
