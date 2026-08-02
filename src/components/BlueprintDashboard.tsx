import React, { useState, useEffect } from 'react';
import { blueprintService } from '../utils/blueprintService';
import { 
  GlobalBlueprintStats, 
  PlayerBlueprintState, 
  SeasonConfig,
  BlueprintDropConfig
} from '../types/blueprints';
import { HOLOBOT_STATS } from '../types/holobot';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface BlueprintDashboardProps {
  userId?: string;
}

export const BlueprintDashboard: React.FC<BlueprintDashboardProps> = ({ userId }) => {
  const { user } = useAuth();
  const [globalStats, setGlobalStats] = useState<GlobalBlueprintStats | null>(null);
  const [playerState, setPlayerState] = useState<PlayerBlueprintState | null>(null);
  const [currentSeason, setCurrentSeason] = useState<SeasonConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeUserId = userId || user?.id;

  useEffect(() => {
    if (!activeUserId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await blueprintService.initialize();
        
        const [stats, state, season] = await Promise.all([
          blueprintService.getGlobalStats(),
          blueprintService.getPlayerBlueprintState(activeUserId),
          blueprintService.getCurrentSeason()
        ]);

        setGlobalStats(stats);
        setPlayerState(state);
        setCurrentSeason(season);
      } catch (err) {
        console.error('Failed to load blueprint data:', err);
        setError('Failed to load blueprint data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [activeUserId]);

  const getSupplyUrgencyText = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'Abundant';
    if (percentage > 25) return 'Moderate';
    if (percentage > 10) return 'Limited';
    return 'Critical';
  };

  const calculateSeasonTimeRemaining = () => {
    if (!currentSeason) return null;
    
    const now = new Date();
    const endDate = new Date(currentSeason.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Season Ended';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Less than 1h';
  };

  const getMostAndLeastMinted = () => {
    if (!globalStats) return { most: null, least: null };
    
    const distribution = globalStats.holobotDistribution;
    const entries = Object.entries(distribution);
    
    if (entries.length === 0) return { most: null, least: null };
    
    const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
    
    return {
      most: { type: sorted[0][0], count: sorted[0][1] as number },
      least: { type: sorted[sorted.length - 1][0], count: sorted[sorted.length - 1][1] as number }
    };
  };

  const canMintHolobot = (holobotType: string, mintType: 'common' | 'legendary') => {
    if (!playerState) return false;
    
    const required = mintType === 'common' ? 10 : 100;
    const available = playerState.blueprintPieces[holobotType] || 0;
    const catalystRequired = mintType === 'legendary' && playerState.mintCatalysts < 1;
    
    return available >= required && !catalystRequired;
  };

  const handleTestDrop = async (source: string) => {
    if (!activeUserId) return;
    
    const config: BlueprintDropConfig = {
      source: source as any,
      basePieces: 5,
      rarityModifier: 1.0,
      playerLevelModifier: 1.0,
      seasonProgressModifier: 1.0,
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    try {
      const result = await blueprintService.awardBlueprintPieces(activeUserId, config);
      
      if (result.success) {
        // Refresh data after successful drop
        const [stats, state] = await Promise.all([
          blueprintService.getGlobalStats(),
          blueprintService.getPlayerBlueprintState(activeUserId)
        ]);
        setGlobalStats(stats);
        setPlayerState(state);
      }
      
      alert(result.message);
    } catch (error) {
      console.error('Failed to test drop:', error);
      alert('Failed to test drop');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blueprint data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { most, least } = getMostAndLeastMinted();
  const timeRemaining = calculateSeasonTimeRemaining();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Season Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ {currentSeason?.name || 'Blueprint Season'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {globalStats?.remainingPieces.toLocaleString() || 0}
              </div>
              <div className="text-sm opacity-80">Blueprint Pieces Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {globalStats?.totalMintsCompleted.toLocaleString() || 0}
              </div>
              <div className="text-sm opacity-80">Total Holobots Minted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                ⏱️ {timeRemaining}
              </div>
              <div className="text-sm opacity-80">Season Ends In</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Supply Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧩 Global Blueprint Supply
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Season Progress</span>
                <Badge variant={globalStats?.remainingPieces === 0 ? 'destructive' : 'secondary'}>
                  {getSupplyUrgencyText(
                    globalStats?.remainingPieces || 0,
                    currentSeason?.maxBlueprintPieces || 500000
                  )}
                </Badge>
              </div>
              <Progress 
                value={((currentSeason?.maxBlueprintPieces || 500000) - (globalStats?.remainingPieces || 0)) / 
                       (currentSeason?.maxBlueprintPieces || 500000) * 100} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>
                  {((currentSeason?.maxBlueprintPieces || 500000) - (globalStats?.remainingPieces || 0)).toLocaleString()} used
                </span>
                <span>{(currentSeason?.maxBlueprintPieces || 500000).toLocaleString()} total</span>
              </div>
            </div>

            {/* Holobot Distribution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(globalStats?.holobotDistribution || {}).map(([type, count]) => (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-lg">{(count as number).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 capitalize">{type}</div>
                  {most?.type === type && (
                    <div className="text-green-500 text-sm mt-1">📈 Most Minted</div>
                  )}
                  {least?.type === type && (
                    <div className="text-red-500 text-sm mt-1">📉 Least Minted</div>
                  )}
                </div>
              ))}
            </div>

            {/* Supply Alerts */}
            {most && least && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    🔥 Most Minted: <strong>{most.type.toUpperCase()}</strong> ({most.count.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    🐢 Least Minted: <strong>{least.type.toUpperCase()}</strong> ({least.count.toLocaleString()})
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Blueprint Inventory */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">My Blueprints</TabsTrigger>
          <TabsTrigger value="minting">Mint Holobots</TabsTrigger>
          <TabsTrigger value="testing">Test Drops</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧩 Your Blueprint Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {playerState?.totalPiecesEarned || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Pieces Earned</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {playerState?.dailyPiecesEarned || 0} / {currentSeason?.dailyPlayerCapAmount || 50}
                  </div>
                  <div className="text-sm text-green-800">Daily Progress</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(HOLOBOT_STATS).map((holobotType) => {
                  const count = playerState?.blueprintPieces[holobotType] || 0;
                  const canMintCommon = count >= 10;
                  const canMintLegendary = count >= 100;
                  
                  return (
                    <div key={holobotType} className="p-4 border rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 capitalize mb-2">
                          {holobotType}
                        </div>
                        <div className="space-y-1">
                          {canMintCommon && (
                            <Badge variant="secondary" className="text-xs">
                              Common Ready
                            </Badge>
                          )}
                          {canMintLegendary && (
                            <Badge variant="default" className="text-xs">
                              Legendary Ready
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⭐ Mint Holobots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <div className="text-lg font-semibold mb-2">Mint Catalysts: {playerState?.mintCatalysts || 0}</div>
                <div className="text-sm text-gray-600">
                  Catalysts are required for legendary mints. Craft them using HOLOS tokens and activity requirements.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(HOLOBOT_STATS).map((holobotType) => {
                  const count = playerState?.blueprintPieces[holobotType] || 0;
                  const canCommon = canMintHolobot(holobotType, 'common');
                  const canLegendary = canMintHolobot(holobotType, 'legendary');
                  
                  return (
                    <div key={holobotType} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold capitalize">{holobotType}</h3>
                        <div className="text-sm text-gray-600">{count} pieces</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Common (10 pieces)</span>
                          <Button 
                            size="sm" 
                            disabled={!canCommon}
                            className="h-8"
                          >
                            {canCommon ? 'Mint' : `Need ${10 - count} more`}
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Legendary (100 pieces + catalyst)</span>
                          <Button 
                            size="sm" 
                            disabled={!canLegendary}
                            variant="secondary"
                            className="h-8"
                          >
                            {canLegendary ? 'Mint' : `Need ${100 - count} more`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Test Blueprint Drops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['quest_rewards', 'sync_training', 'arena_battles', 'booster_packs'].map((source) => (
                  <Button
                    key={source}
                    onClick={() => handleTestDrop(source)}
                    className="h-12"
                    variant="outline"
                  >
                    {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlueprintDashboard;