// ============================================================================
// Battle Arena View
// Main battle visualization component
// ============================================================================

import { useEffect, useState } from 'react';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { FighterDisplay } from './FighterDisplay';
import { ActionCardHand } from './ActionCardHand';
import { BattleControls } from './BattleControls';
import { BattlefieldCenter } from './BattlefieldCenter';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, Coins, Zap, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BattleArenaView() {
  const [showStats, setShowStats] = useState(false);
  
  const {
    currentBattle,
    uiState,
    playCard,
    enterDefenseMode,
    useHack,
    useSpecialAttack,
    abandonBattle,
  } = useArenaBattleStore();

  // Hide bottom nav during battle
  useEffect(() => {
    const nav = document.querySelector('nav[class*="fixed bottom-0"]');
    if (nav) {
      (nav as HTMLElement).style.display = 'none';
    }
    
    return () => {
      const nav = document.querySelector('nav[class*="fixed bottom-0"]');
      if (nav) {
        (nav as HTMLElement).style.display = '';
      }
    };
  }, []);
  
  const navigate = useNavigate();

  // Keyboard shortcuts for battle cards
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger during victory/defeat screens
      if (uiState.showVictoryScreen || uiState.showDefeatScreen) {
        return;
      }

      if (!currentBattle) return;

      const key = e.key.toLowerCase();
      const { player } = currentBattle;

      switch (key) {
        case 's': // Strike
          const strikeCard = player.hand.find(c => c.type === 'strike');
          if (strikeCard && player.stamina >= strikeCard.staminaCost) {
            playCard(strikeCard.id);
          }
          break;

        case 'd': // Defend
          const defendCard = player.hand.find(c => c.type === 'defense');
          if (defendCard && player.stamina >= defendCard.staminaCost) {
            playCard(defendCard.id);
          }
          break;

        case 'c': // Combo
          const comboCard = player.hand.find(c => c.type === 'combo');
          if (comboCard && player.stamina >= comboCard.staminaCost) {
            playCard(comboCard.id);
          }
          break;

        case 'f': // Finisher
          const finisherCard = player.hand.find(c => c.type === 'finisher');
          if (finisherCard && player.stamina >= finisherCard.staminaCost && player.specialMeter >= 100) {
            playCard(finisherCard.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentBattle, uiState, playCard]);

  if (!currentBattle) return null;

  const { player, opponent } = currentBattle;
  
  // Show victory/defeat screen
  if (uiState.showVictoryScreen || uiState.showDefeatScreen) {
    const isVictory = uiState.showVictoryScreen;
    const rewards = currentBattle.potentialRewards;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-2 sm:p-3 md:p-6 py-3 sm:py-4 md:py-6">
        <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-5 border-2 border-purple-500/50 shadow-2xl overflow-y-auto max-h-[92vh]">
          {/* Compact Result Header */}
          <div className="text-center mb-2 sm:mb-3 md:mb-5">
            {isVictory ? (
              <>
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-1 sm:mb-2 text-yellow-400" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-0.5 sm:mb-1">
                  {currentBattle.roundsWon === currentBattle.totalRounds ? 'COMPLETE!' : 'VICTORY!'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300">
                  {currentBattle.roundsWon}/{currentBattle.totalRounds} Rounds Won
                </p>
              </>
            ) : (
              <>
                <Skull className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-1 sm:mb-2 text-red-400" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-0.5 sm:mb-1">
                  DEFEAT
                </h1>
                <p className="text-xs sm:text-sm text-gray-300">
                  {opponent.name} wins
                </p>
              </>
            )}
          </div>

          {/* Flippable Stats/Rewards Card */}
          <div 
            className="relative mb-2 sm:mb-3 md:mb-4 cursor-pointer"
            onClick={() => setShowStats(!showStats)}
            style={{ 
              perspective: '1000px',
              minHeight: showStats ? '200px' : 'auto'
            }}
          >
            <div 
              className="relative transition-transform duration-500 preserve-3d"
              style={{
                transformStyle: 'preserve-3d',
                transform: showStats ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front: Rewards */}
              <div 
                className="backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >

                {/* Rewards Section */}
                {isVictory && rewards && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-2 sm:p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-1">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                        Rewards
                      </h2>
                      <button className="text-[10px] sm:text-xs text-cyan-400 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        View Stats
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {rewards.exp && (
                        <div className="flex items-center gap-1 bg-blue-500/20 p-1.5 sm:p-2 rounded">
                          <Zap className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-300">XP</p>
                            <p className="text-xs sm:text-sm font-bold text-blue-400 truncate">+{Math.floor(rewards.exp)}</p>
                          </div>
                        </div>
                      )}
                      {rewards.syncPoints && (
                        <div className="flex items-center gap-1 bg-purple-500/20 p-1.5 sm:p-2 rounded">
                          <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-300">SP</p>
                            <p className="text-xs sm:text-sm font-bold text-purple-400 truncate">+{Math.floor(rewards.syncPoints)}</p>
                          </div>
                        </div>
                      )}
                      {rewards.gachaTickets && rewards.gachaTickets > 0 && (
                        <div className="flex items-center gap-1 bg-pink-500/20 p-1.5 sm:p-2 rounded">
                          <Trophy className="w-3 h-3 text-pink-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-300">Gacha</p>
                            <p className="text-xs sm:text-sm font-bold text-pink-400 truncate">+{rewards.gachaTickets}</p>
                          </div>
                        </div>
                      )}
                      {rewards.boosterPackTickets && rewards.boosterPackTickets > 0 && (
                        <div className="flex items-center gap-1 bg-orange-500/20 p-1.5 sm:p-2 rounded">
                          <Trophy className="w-3 h-3 text-orange-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-300">Booster</p>
                            <p className="text-xs sm:text-sm font-bold text-orange-400 truncate">+{rewards.boosterPackTickets}</p>
                          </div>
                        </div>
                      )}
                      {rewards.holos && rewards.holos > 0 && (
                        <div className="flex items-center gap-1 bg-green-500/20 p-1.5 sm:p-2 rounded">
                          <Coins className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-300">HOLOS</p>
                            <p className="text-xs sm:text-sm font-bold text-green-400 truncate">+{rewards.holos}</p>
                          </div>
                        </div>
                      )}
                      {rewards.blueprintRewards && rewards.blueprintRewards.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Blueprints:</p>
                          <div className="space-y-1">
                            {rewards.blueprintRewards.map((blueprint, index) => (
                              <div key={index} className="flex items-center gap-1 bg-cyan-500/20 p-1.5 rounded">
                                <Trophy className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                <p className="text-xs font-bold text-cyan-400 truncate">
                                  +{blueprint.amount} {blueprint.holobotKey.toUpperCase()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bonus Rewards - Compact */}
                    {(rewards.perfectDefenseBonus || rewards.comboBonus || rewards.speedBonus) && (
                      <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                        <p className="text-[9px] text-gray-400 mb-0.5">Bonus:</p>
                        <div className="flex flex-wrap gap-1">
                          {rewards.comboBonus && (
                            <span className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded text-[9px]">
                              ⚡ +{rewards.comboBonus}
                            </span>
                          )}
                          {rewards.perfectDefenseBonus && (
                            <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[9px]">
                              🛡️ +{rewards.perfectDefenseBonus}
                            </span>
                          )}
                          {rewards.speedBonus && (
                            <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-[9px]">
                              ⏱️ +{rewards.speedBonus}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Back: Battle Stats */}
              <div 
                className="absolute inset-0 backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="bg-gradient-to-r from-blue-900/30 to-red-900/30 p-2 sm:p-3 md:p-4 rounded-lg h-full">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-1">
                      📊 Battle Stats
                    </h2>
                    <button className="text-[10px] sm:text-xs text-cyan-400 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      View Rewards
                    </button>
                  </div>

                  {/* All 3 Rounds Summary */}
                  <div className="space-y-1">
                    {Array.from({ length: currentBattle.totalRounds }).map((_, index) => {
                      const roundNum = index + 1;
                      const opponentForRound = currentBattle.opponentLineup[index];
                      const isCurrentRound = roundNum === currentBattle.currentRound;
                      const wasWon = roundNum < currentBattle.currentRound 
                        ? (currentBattle.roundsWon >= roundNum) 
                        : (roundNum === currentBattle.currentRound && currentBattle.status === 'completed' && currentBattle.roundsWon >= roundNum);
                      
                      return (
                        <div 
                          key={roundNum} 
                          className={`p-1.5 rounded ${
                            isCurrentRound 
                              ? 'bg-yellow-900/30 border border-yellow-500/50' 
                              : wasWon 
                                ? 'bg-green-900/20 border border-green-500/30' 
                                : 'bg-gray-900/20 border border-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">R{roundNum}:</span>
                              <span className="text-xs font-bold text-white">{player.name}</span>
                              <span className="text-[10px] text-gray-500">vs</span>
                              <span className="text-xs font-bold text-red-400">{opponentForRound?.toUpperCase() || 'TBD'}</span>
                            </div>
                            <div>
                              {isCurrentRound && currentBattle.status === 'active' && (
                                <span className="text-[9px] text-yellow-400">▶ Active</span>
                              )}
                              {wasWon && (
                                <span className="text-[9px] text-green-400">✓ Won</span>
                              )}
                              {!isCurrentRound && !wasWon && roundNum < currentBattle.currentRound && (
                                <span className="text-[9px] text-red-400">✗ Lost</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Current Round Details */}
                  {currentBattle.status === 'active' && (
                    <div className="mt-2 bg-black/20 p-1.5 rounded">
                      <p className="text-[9px] text-gray-400 mb-0.5">Current Stats:</p>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div>
                          <span className="text-blue-400">{player.name}:</span>
                          <span className="text-white ml-1">{player.currentHP}/{player.maxHP} HP</span>
                        </div>
                        <div>
                          <span className="text-red-400">{opponent.name}:</span>
                          <span className="text-white ml-1">{opponent.currentHP}/{opponent.maxHP} HP</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                abandonBattle();
                navigate('/app');
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 sm:py-2.5 text-xs sm:text-sm font-bold"
            >
              Return to Arena
            </Button>
            <Button
              onClick={() => {
                abandonBattle();
                window.location.reload();
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 sm:py-2.5 text-xs sm:text-sm font-bold"
            >
              Battle Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden pb-0">
      {/* Arena Header - Ultra Compact */}
      <div className="p-1 sm:p-2 text-center border-b border-purple-500/30">
        <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          ARENA V2
        </h1>
        <p className="text-[9px] sm:text-[10px] text-gray-400">
          R{currentBattle.currentRound}/{currentBattle.totalRounds} • W:{currentBattle.roundsWon}
        </p>
      </div>

      {/* Opponent (Top) - Minimal Padding */}
      <div className="p-1 sm:p-2">
        <FighterDisplay
          fighter={opponent}
          position="top"
          isActive={false}
        />
      </div>

      {/* Battlefield Center - Minimal Height */}
      <div className="relative overflow-hidden" style={{ minHeight: '80px', maxHeight: '120px' }}>
        <BattlefieldCenter battle={currentBattle} />
      </div>

      {/* Player (Bottom) - Minimal Padding */}
      <div className="p-1 sm:p-2 space-y-1 sm:space-y-1.5">
        <FighterDisplay
          fighter={player}
          position="bottom"
          isActive={true}
        />

        {/* Player Hand */}
        <ActionCardHand
          cards={player.hand}
          onCardSelect={playCard}
          disabled={currentBattle.status !== 'active'}
        />

        {/* Battle Controls */}
        <BattleControls
          onDefenseMode={enterDefenseMode}
          onHack={useHack}
          onSpecial={useSpecialAttack}
          hackUsed={currentBattle.hackUsed}
          canUseSpecial={player.specialMeter >= 100}
        />
      </div>
    </div>
  );
}
