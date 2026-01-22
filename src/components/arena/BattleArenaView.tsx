// ============================================================================
// Battle Arena View
// Main battle visualization component
// ============================================================================

import { useEffect } from 'react';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { FighterDisplay } from './FighterDisplay';
import { ActionCardHand } from './ActionCardHand';
import { BattleControls } from './BattleControls';
import { BattlefieldCenter } from './BattlefieldCenter';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BattleArenaView() {
  const {
    currentBattle,
    uiState,
    playCard,
    enterDefenseMode,
    useHack,
    useSpecialAttack,
    abandonBattle,
  } = useArenaBattleStore();
  
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
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur rounded-2xl p-8 border-2 border-purple-500/50 shadow-2xl">
          {/* Result Header */}
          <div className="text-center mb-8">
            {isVictory ? (
              <>
                <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-400 animate-bounce" />
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                  {currentBattle.roundsWon === currentBattle.totalRounds ? 'ARENA COMPLETE!' : 'VICTORY!'}
                </h1>
                <p className="text-xl text-gray-300">
                  Rounds Won: {currentBattle.roundsWon}/{currentBattle.totalRounds}
                </p>
                {currentBattle.roundsWon === currentBattle.totalRounds && (
                  <p className="text-lg text-green-400 mt-2">
                    🏆 Perfect Run! All opponents defeated! 🏆
                  </p>
                )}
              </>
            ) : (
              <>
                <Skull className="w-24 h-24 mx-auto mb-4 text-red-400" />
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
                  DEFEAT
                </h1>
                <p className="text-xl text-gray-300">
                  {opponent.name} wins this round...
                </p>
              </>
            )}
          </div>

          {/* Battle Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Your Stats</p>
              <p className="text-lg font-bold text-white">{player.name}</p>
              <p className="text-sm text-gray-300">HP: {player.currentHP}/{player.maxHP}</p>
              <p className="text-sm text-gray-300">Damage Dealt: {player.totalDamageDealt}</p>
            </div>
            <div className="bg-red-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Opponent Stats</p>
              <p className="text-lg font-bold text-white">{opponent.name}</p>
              <p className="text-sm text-gray-300">HP: {opponent.currentHP}/{opponent.maxHP}</p>
              <p className="text-sm text-gray-300">Damage Dealt: {opponent.totalDamageDealt}</p>
            </div>
          </div>

          {/* Rewards */}
          {isVictory && rewards && (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Rewards Earned
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {rewards.exp && (
                  <div className="flex items-center gap-2 bg-blue-500/20 p-3 rounded">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-300">Experience</p>
                      <p className="text-lg font-bold text-blue-400">+{Math.floor(rewards.exp)} XP</p>
                    </div>
                  </div>
                )}
                {rewards.syncPoints && (
                  <div className="flex items-center gap-2 bg-purple-500/20 p-3 rounded">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-300">Sync Points</p>
                      <p className="text-lg font-bold text-purple-400">+{Math.floor(rewards.syncPoints)}</p>
                    </div>
                  </div>
                )}
                {rewards.gachaTickets && rewards.gachaTickets > 0 && (
                  <div className="flex items-center gap-2 bg-pink-500/20 p-3 rounded">
                    <Trophy className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="text-sm text-gray-300">Gacha Tickets</p>
                      <p className="text-lg font-bold text-pink-400">+{rewards.gachaTickets}</p>
                    </div>
                  </div>
                )}
                {rewards.boosterPackTickets && rewards.boosterPackTickets > 0 && (
                  <div className="flex items-center gap-2 bg-orange-500/20 p-3 rounded">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-sm text-gray-300">Booster Packs</p>
                      <p className="text-lg font-bold text-orange-400">+{rewards.boosterPackTickets}</p>
                    </div>
                  </div>
                )}
                {rewards.holos && rewards.holos > 0 && (
                  <div className="flex items-center gap-2 bg-green-500/20 p-3 rounded">
                    <Coins className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-300">HOLOS (Tier 3 Only!)</p>
                      <p className="text-lg font-bold text-green-400">+{rewards.holos}</p>
                    </div>
                  </div>
                )}
                {rewards.blueprintRewards && rewards.blueprintRewards.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <p className="text-sm text-gray-300 font-semibold mb-2">Blueprint Pieces</p>
                    {rewards.blueprintRewards.map((blueprint, index) => (
                      <div key={index} className="flex items-center gap-2 bg-cyan-500/20 p-3 rounded">
                        <Trophy className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-lg font-bold text-cyan-400">
                            +{blueprint.amount} {blueprint.holobotKey.toUpperCase()} pieces
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Bonus Rewards */}
              {(rewards.perfectDefenseBonus || rewards.comboBonus || rewards.speedBonus) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Bonus Rewards:</p>
                  <div className="flex flex-wrap gap-2">
                    {rewards.perfectDefenseBonus && (
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        🛡️ Perfect Defense: +{rewards.perfectDefenseBonus} XP
                      </span>
                    )}
                    {rewards.comboBonus && (
                      <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
                        ⚡ Combos: +{rewards.comboBonus} XP
                      </span>
                    )}
                    {rewards.speedBonus && (
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                        ⏱️ Speed: +{rewards.speedBonus} XP
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {rewards.eloChange && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">Ranked ELO</p>
                  <p className={`text-lg font-bold ${rewards.eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rewards.eloChange > 0 ? '+' : ''}{rewards.eloChange}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                abandonBattle();
                navigate('/app');
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg font-bold"
            >
              Return to Arena
            </Button>
            <Button
              onClick={() => {
                abandonBattle();
                // Restart battle with same configuration
                window.location.reload();
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-bold"
            >
              Battle Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Arena Header */}
      <div className="p-4 text-center border-b border-purple-500/30">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          HOLOBOTS ARENA V2
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Round {currentBattle.currentRound}/{currentBattle.totalRounds} • Wins: {currentBattle.roundsWon}
        </p>
      </div>

      {/* Opponent (Top) */}
      <div className="p-4">
        <FighterDisplay
          fighter={opponent}
          position="top"
          isActive={false}
        />
      </div>

      {/* Battlefield Center */}
      <div className="flex-1 relative overflow-hidden">
        <BattlefieldCenter battle={currentBattle} />
      </div>

      {/* Player (Bottom) */}
      <div className="p-4 space-y-4">
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
