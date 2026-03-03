// ============================================================================
// Battle Arena View
// Main battle visualization component
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { BattleHPBars } from './BattleHPBars';
import { BattleLogDisplay } from './BattleLogDisplay';
import { ActionCardHand } from './ActionCardHand';
import { EquippedParts } from './EquippedParts';
import { BattleControls } from './BattleControls';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, RotateCcw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHolobotImagePath } from '@/utils/holobotImageUtils';
import HolosIcon from '@/assets/icons/HOlos.svg';
import ExpIcon from '@/assets/icons/EXP.svg';
import SyncPointIcon from '@/assets/icons/SyncPoint.svg';

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

  const handleCardPlay = useCallback((cardId: string) => {
    if (!currentBattle) return;
    playCard(cardId);
  }, [currentBattle, playCard]);

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
            handleCardPlay(strikeCard.id);
          }
          break;

        case 'd': // Defend
          const defendCard = player.hand.find(c => c.type === 'defense');
          if (defendCard && player.stamina >= defendCard.staminaCost) {
            handleCardPlay(defendCard.id);
          }
          break;

        case 'c': // Combo
          const comboCard = player.hand.find(c => c.type === 'combo');
          if (comboCard && player.stamina >= comboCard.staminaCost) {
            handleCardPlay(comboCard.id);
          }
          break;

        case 'f': // Finisher
          const finisherCard = player.hand.find(c => c.type === 'finisher');
          if (finisherCard && player.stamina >= finisherCard.staminaCost && player.specialMeter >= 100) {
            handleCardPlay(finisherCard.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentBattle, uiState, handleCardPlay]);

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
                  <div className="bg-black border-3 border-[#F5C400] p-3 sm:p-4 md:p-5" style={{
                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                  }}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4 border-b-2 border-[#F5C400]/30 pb-2">
                      <h2 className="text-base sm:text-lg md:text-xl font-black text-[#F5C400] uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        Rewards
                      </h2>
                      <button className="text-[10px] sm:text-xs text-white/70 hover:text-white flex items-center gap-1 uppercase tracking-wide">
                        <RotateCcw className="w-3 h-3" />
                        Stats
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {rewards.holos && rewards.holos > 0 && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-3 sm:p-4 border-2 border-[#F5C400]/50" style={{
                          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                        }}>
                          <img src={HolosIcon} alt="Holos" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" />
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-xs sm:text-sm uppercase tracking-wider">+</span>
                            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F5C400]">{rewards.holos}</span>
                          </div>
                        </div>
                      )}
                      {rewards.syncPoints && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-3 sm:p-4 border-2 border-cyan-500/50" style={{
                          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                        }}>
                          <img src={SyncPointIcon} alt="Sync Points" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" />
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-xs sm:text-sm uppercase tracking-wider">+</span>
                            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-cyan-400">{Math.floor(rewards.syncPoints)}</span>
                          </div>
                        </div>
                      )}
                      {rewards.exp && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-3 sm:p-4 border-2 border-orange-500/50" style={{
                          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                        }}>
                          <img src={ExpIcon} alt="Experience" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" />
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-xs sm:text-sm uppercase tracking-wider">+</span>
                            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-orange-400">{Math.floor(rewards.exp)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Blueprint Rewards */}
                    {rewards.blueprintRewards && rewards.blueprintRewards.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wide">
                            Blueprint Pieces
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {rewards.blueprintRewards.map((blueprint, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-2 sm:p-3 border border-purple-500/30 rounded-lg"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                                  <img 
                                    src={getHolobotImagePath(blueprint.holobotKey)} 
                                    alt={blueprint.holobotKey}
                                    className="w-full h-full object-cover rounded-lg border-2 border-purple-500/50"
                                    onError={(e) => {
                                      // Fallback to icon if image fails to load
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden w-full h-full bg-purple-500/20 rounded-lg items-center justify-center border-2 border-purple-500/50">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs sm:text-sm font-bold text-white uppercase">
                                    {blueprint.holobotKey}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] text-purple-300 uppercase tracking-wider">
                                    Blueprint
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-white/70 text-xs">+</span>
                                <span className="text-xl sm:text-2xl font-black text-purple-400">
                                  {blueprint.amount}
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-purple-300 ml-0.5">pieces</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black relative z-20 pb-safe">
      {/* Arena Header - HUD Style */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-b-4 border-black relative" style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      }}>
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-black uppercase tracking-widest">
            ARENA V2
          </h1>
          <div className="bg-black px-3 py-1 border-2 border-[#F5C400]" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <p className="text-[10px] sm:text-xs text-[#F5C400] font-bold uppercase tracking-wide">
              R{currentBattle.currentRound}/{currentBattle.totalRounds} • W:{currentBattle.roundsWon}
            </p>
          </div>
        </div>
      </div>

      {/* Battle Layout Container */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2 sm:space-y-3 flex flex-col">
        {/* HP & Stamina Bars - Side by Side on sm+, stacked on mobile */}
        <div className="flex-shrink-0 min-w-0">
          <BattleHPBars player={player} opponent={opponent} />
        </div>

        {/* Player Hand */}
        <div className="flex-shrink-0 min-w-0">
          <ActionCardHand
          cards={player.hand}
          onCardSelect={handleCardPlay}
          disabled={currentBattle.status !== 'active'}
        />
        </div>

        {/* Battle Log - Moved below Player Hand */}
        <div className="flex-shrink-0 min-w-0">
        <BattleLogDisplay battle={currentBattle} />
        </div>

        {/* Equipped Parts */}
        <div className="flex-shrink-0 min-w-0">
        <EquippedParts fighter={player} />
        </div>

        {/* Battle Controls */}
        <div className="flex-shrink-0 min-w-0">
        <BattleControls
          onDefenseMode={enterDefenseMode}
          onHack={useHack}
          onSpecial={useSpecialAttack}
          hackUsed={currentBattle.hackUsed}
          canUseSpecial={player.specialMeter >= 100}
        />
        </div>
      </div>
    </div>
  );
}
