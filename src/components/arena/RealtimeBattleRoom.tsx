import React, { useEffect, useState } from 'react';
import { useRealtimeArena } from '@/hooks/useRealtimeArena';
import { HOLOBOT_STATS } from '@/types/holobot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { RealtimeBattleCards } from './RealtimeBattleCards';
import { HolobotCard } from '@/components/HolobotCard';
import { useAuth } from '@/contexts/auth';
import { useHolobotPartsStore } from '@/stores/holobotPartsStore';
import { useSyncPointsStore } from '@/stores/syncPointsStore';
import { calculateActualHolobotStats } from '@/utils/holobotStatsCalculator';

// 2-minute battle timer
const BATTLE_DURATION_MS = 120000; // 2 minutes

/**
 * Real-Time Battle Room Component
 * 
 * Features:
 * - Create or join battle rooms
 * - Real-time synchronization with Firebase
 * - Turn-based combat with automatic resolution
 * - Connection status monitoring
 * - Matchmaking support
 */
export function RealtimeBattleRoom() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getEquippedParts } = useHolobotPartsStore();
  const { getHolobotAttributeLevel } = useSyncPointsStore();
  
  const {
    room,
    loading,
    error,
    myRole,
    opponentRole,
    isMyTurn,
    connectionStatus,
    matchmakingStatus,
    createRoom,
    joinRoom,
    leaveRoom,
    playAction,
    enterMatchmaking,
    cancelMatchmaking,
  } = useRealtimeArena();

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedHolobot, setSelectedHolobot] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  
  // Set default holobot to first owned holobot
  useEffect(() => {
    if (user?.holobots && user.holobots.length > 0 && !selectedHolobot) {
      const firstHolobot = user.holobots[0].name.toLowerCase();
      setSelectedHolobot(firstHolobot);
    }
  }, [user?.holobots, selectedHolobot]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Show winner notification
  useEffect(() => {
    if (room?.status === 'completed' && room.winner) {
      const didWin = room.winner === myRole;
      toast({
        title: didWin ? '🎉 Victory!' : '😢 Defeat',
        description: didWin ? 'You won the battle!' : 'Better luck next time!',
        variant: didWin ? 'default' : 'destructive',
      });
    }
  }, [room?.status, room?.winner, myRole, toast]);

  // Battle timer countdown
  useEffect(() => {
    if (!room || room.status !== 'active') return;

    const startTime = room.createdAt instanceof Date 
      ? room.createdAt.getTime() 
      : Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((BATTLE_DURATION_MS - elapsed) / 1000));
      setTimeRemaining(remaining);

      // Time's up - declare winner based on HP
      if (remaining === 0 && myRole && opponentRole) {
        const myPlayer = room.players[myRole];
        const opponent = room.players[opponentRole];
        
        // Determine winner by HP percentage
        const myHpPercent = (myPlayer.health / myPlayer.maxHealth) * 100;
        const oppHpPercent = (opponent.health / opponent.maxHealth) * 100;
        
        const winner = myHpPercent > oppHpPercent ? myRole : opponentRole;
        
        // This will be handled by the hook, but we can show a toast
        toast({
          title: '⏰ Time\'s Up!',
          description: `Winner determined by HP!`,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room, myRole, opponentRole, toast]);

  const handleCreateRoom = async () => {
    try {
      // Calculate actual stats with all boosts
      const actualStats = calculateActualHolobotStats(
        selectedHolobot,
        user,
        getEquippedParts,
        getHolobotAttributeLevel
      );
      
      console.log('[PvP] Creating room with actual stats:', actualStats);
      const roomCode = await createRoom(actualStats);
      toast({
        title: 'Room Created!',
        description: `Room code: ${roomCode}`,
      });
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room code',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Calculate actual stats with all boosts
      const actualStats = calculateActualHolobotStats(
        selectedHolobot,
        user,
        getEquippedParts,
        getHolobotAttributeLevel
      );
      
      console.log('[PvP] Joining room with actual stats:', actualStats);
      await joinRoom(roomCodeInput.toUpperCase(), actualStats);
      toast({
        title: 'Joined Room!',
        description: 'Battle starting...',
      });
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleQuickMatch = async () => {
    try {
      // Calculate actual stats with all boosts
      const actualStats = calculateActualHolobotStats(
        selectedHolobot,
        user,
        getEquippedParts,
        getHolobotAttributeLevel
      );
      
      console.log('[PvP] Matchmaking with actual stats:', actualStats);
      await enterMatchmaking(actualStats, 'pvp');
      toast({
        title: 'Searching...',
        description: 'Looking for an opponent',
      });
    } catch (err) {
      console.error('Failed to enter matchmaking:', err);
    }
  };

  const handlePlayCard = async (cardId: string) => {
    try {
      await playAction(cardId);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to play card',
        variant: 'destructive',
      });
    }
  };

  // No room - show lobby
  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <Card className="w-full max-w-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Real-Time Arena</h1>

          {/* Holobot Selection - ONLY OWNED HOLOBOTS */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-white">Select Your Holobot</label>
            <select
              value={selectedHolobot}
              onChange={(e) => setSelectedHolobot(e.target.value)}
              className="w-full px-4 py-2 rounded-md border bg-gray-800 border-gray-700 text-white"
            >
              {user?.holobots && user.holobots.length > 0 ? (
                user.holobots.map((userBot) => {
                  const holobotKey = userBot.name.toLowerCase();
                  const holobotData = HOLOBOT_STATS[holobotKey as keyof typeof HOLOBOT_STATS];
                  if (!holobotData) return null;
                  
                  return (
                    <option key={holobotKey} value={holobotKey}>
                      {holobotData.name} (Lv.{userBot.level || 1})
                    </option>
                  );
                })
              ) : (
                <option value="">No Holobots owned</option>
              )}
            </select>
          </div>

          {/* Matchmaking */}
          {matchmakingStatus === 'idle' ? (
            <div className="space-y-4 mb-8">
              <Button
                onClick={handleQuickMatch}
                className="w-full py-6 text-lg"
                disabled={loading}
              >
                🎮 Quick Match
              </Button>
            </div>
          ) : matchmakingStatus === 'searching' ? (
            <div className="text-center mb-8">
              <p className="text-lg mb-4">🔍 Searching for opponent...</p>
              <Button onClick={cancelMatchmaking} variant="outline">
                Cancel
              </Button>
            </div>
          ) : null}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">OR</span>
            </div>
          </div>

          {/* Create/Join Room */}
          <div className="space-y-4">
            <Button
              onClick={handleCreateRoom}
              className="w-full py-6 text-lg"
              variant="outline"
              disabled={loading}
            >
              🏠 Create Private Room
            </Button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded-md border bg-gray-800 border-gray-700"
                maxLength={6}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={loading || !roomCodeInput.trim()}
              >
                Join Room
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Battle in progress
  if (!myRole || !opponentRole) return null;

  const myPlayer = room.players[myRole];
  const opponent = room.players[opponentRole];
  const myAction = myRole === 'p1' ? room.p1Action : room.p2Action;
  const opponentAction = opponentRole === 'p1' ? room.p1Action : room.p2Action;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 relative z-20">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-purple-400">Room: {room.roomCode}</span>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {formatTime(timeRemaining)}
          </div>
        </div>

        <Button onClick={leaveRoom} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
          Leave
        </Button>
      </div>

      {/* Opponent HP Bar (Compact - Arena V2 Style) */}
      <div className="bg-black/40 rounded-lg p-3 mb-4 border border-purple-500/30">
        <div className="flex items-center gap-3">
          {/* Opponent TCG Card */}
          <div className="transform scale-[0.4] origin-left -ml-6">
            <HolobotCard 
              stats={opponent.holobot}
              variant="red"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">{opponent.username}</span>
              <span className="text-xs text-gray-400">{opponent.holobot.name}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">HP</span>
                <Progress value={(opponent.health / opponent.maxHealth) * 100} className="h-2 flex-1" />
                <span className="text-xs text-gray-300">{opponent.health}/{opponent.maxHealth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Stamina</span>
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: opponent.maxStamina }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-sm ${
                        i < opponent.stamina ? 'bg-yellow-400' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-300">{opponent.stamina}/{opponent.maxStamina}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Special</span>
                <Progress value={opponent.specialMeter} className="h-2 flex-1" />
                <span className="text-xs text-cyan-300">{opponent.specialMeter}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log (Compact) */}
      <div className="bg-black/40 rounded-lg p-3 mb-4 border border-purple-500/30 max-h-32 overflow-y-auto">
        <div className="text-xs font-bold text-purple-400 mb-2">BATTLE LOG</div>
        <div className="space-y-1">
          {(room.battleLog || []).slice(-6).reverse().map((log, i) => (
            <div key={i} className="text-xs text-gray-300">
              <span className="text-cyan-400">Turn {log.turnNumber}:</span> {log.message}
            </div>
          ))}
          {(!room.battleLog || room.battleLog.length === 0) && (
            <div className="text-xs text-gray-500 italic">Battle starting...</div>
          )}
        </div>
      </div>

      {/* Action Cards - Always Available (Real-Time Combat!) */}
      <Card className="p-4 mb-4">
        <h3 className="text-lg font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Your Hand
        </h3>
        <div className="text-center text-xs text-cyan-400 mb-2">
          ⚡ Real-Time Combat - Attack Anytime!
        </div>
        <RealtimeBattleCards
          hand={myPlayer.hand || []}
          onCardSelect={handlePlayCard}
          playerStamina={myPlayer.stamina}
          specialMeter={myPlayer.specialMeter}
        />
      </Card>

      {/* Your HP Bar (Compact - Arena V2 Style) */}
      <div className="bg-black/40 rounded-lg p-3 border-2 border-cyan-500/50">
        <div className="flex items-center gap-3">
          {/* Your TCG Card */}
          <div className="transform scale-[0.4] origin-left -ml-6">
            <HolobotCard 
              stats={myPlayer.holobot}
              variant="blue"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">{myPlayer.username} (You)</span>
              <span className="text-xs text-gray-400">{myPlayer.holobot.name}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">HP</span>
                <Progress value={(myPlayer.health / myPlayer.maxHealth) * 100} className="h-2 flex-1" />
                <span className="text-xs text-gray-300">{myPlayer.health}/{myPlayer.maxHealth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Stamina</span>
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: myPlayer.maxStamina }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-sm ${
                        i < myPlayer.stamina ? 'bg-yellow-400' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-300">{myPlayer.stamina}/{myPlayer.maxStamina}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Special</span>
                <Progress value={myPlayer.specialMeter} className="h-2 flex-1" />
                <span className="text-xs text-cyan-300">{myPlayer.specialMeter}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Screen */}
      {room.status === 'completed' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-12 text-center max-w-md">
            <div className="text-6xl mb-4">
              {room.winner === myRole ? '🎉' : '😢'}
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {room.winner === myRole ? 'Victory!' : 'Defeat'}
            </h2>
            
            {room.winner === myRole && (
              <div className="mb-8 space-y-3">
                <p className="text-lg text-cyan-400 font-bold mb-4">Rewards Earned!</p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-blue-900/30 p-3 rounded">
                    <div className="text-sm text-gray-400">EXP</div>
                    <div className="text-xl font-bold text-blue-400">+150</div>
                  </div>
                  <div className="bg-yellow-900/30 p-3 rounded">
                    <div className="text-sm text-gray-400">HOLOS</div>
                    <div className="text-xl font-bold text-yellow-400">+100</div>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded">
                    <div className="text-sm text-gray-400">Arena Passes</div>
                    <div className="text-xl font-bold text-purple-400">+3 🎫</div>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded">
                    <div className="text-sm text-gray-400">Gacha Tickets</div>
                    <div className="text-xl font-bold text-green-400">+5 🎫</div>
                  </div>
                </div>
                {myPlayer.perfectDefenses > 0 && (
                  <div className="text-sm text-green-400">
                    💎 Perfect Defense Bonus: +{myPlayer.perfectDefenses * 20} EXP
                  </div>
                )}
                {myPlayer.combosCompleted > 0 && (
                  <div className="text-sm text-orange-400">
                    ⚡ Combo Bonus: +{myPlayer.combosCompleted * 30} EXP
                  </div>
                )}
              </div>
            )}
            
            {room.winner !== myRole && (
              <p className="text-gray-400 mb-8">
                Better luck next time!
              </p>
            )}
            
            <Button onClick={leaveRoom} size="lg" className="w-full">
              Return to Lobby
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
