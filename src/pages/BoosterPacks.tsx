import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import BoosterPackCard from '../components/boosterpack/BoosterPackCard';
import PackOpeningAnimation from '../components/boosterpack/PackOpeningAnimation';
import { useAuth } from '../contexts/auth';
import { useBoosterPackStore } from '../stores/boosterPackStore';
import { useHolobotPartsStore } from '../stores/holobotPartsStore';
import { BoosterPackType, BOOSTER_PACK_TYPES, BoosterPackItem } from '../types/boosterPack';
import { toast } from 'sonner';
import { Package, History, Coins, Ticket, Trophy, Calendar, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BoosterPacks: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { openBoosterPack, isOpening, currentOpenResult, clearOpenResult, openedPacks } = useBoosterPackStore();
  const { loadPartsFromUser, loadEquippedPartsFromUser } = useHolobotPartsStore();
  const [selectedTab, setSelectedTab] = useState('packs');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.parts) {
      loadPartsFromUser(user.parts);
    }
    if (user?.equippedParts) {
      loadEquippedPartsFromUser(user.equippedParts);
    }
  }, [user?.parts, user?.equippedParts, loadPartsFromUser, loadEquippedPartsFromUser]);

  const handlePurchasePack = async (packType: BoosterPackType, paymentMethod: 'holos' | 'tickets') => {
    if (!user) {
      toast.error('Please log in to purchase packs');
      return;
    }

    const packConfig = BOOSTER_PACK_TYPES[packType];
    const cost = paymentMethod === 'holos' ? packConfig.cost.holosTokens : packConfig.cost.gachaTickets;

    if (!cost) {
      toast.error('Invalid payment method for this pack');
      return;
    }

    const userCurrency = paymentMethod === 'holos' ? (user.holosTokens || 0) : (user.gachaTickets || 0);

    if (userCurrency < cost) {
      toast.error(`Insufficient ${paymentMethod === 'holos' ? 'HOLOS tokens' : 'Gacha Tickets'}`);
      return;
    }

    try {
      // Deduct currency
      const updateData = paymentMethod === 'holos' 
        ? { holosTokens: (user.holosTokens || 0) - cost }
        : { gachaTickets: (user.gachaTickets || 0) - cost };
      
      await updateUser(updateData);

      // Open the pack
      const result = await openBoosterPack(packType);
      
      // Process the results and save to database
      const newParts: any[] = [];
      let holosGained = 0;
      let ticketsGained = 0;
      let blueprintsGained: Record<string, number> = {};
      
      result.items.forEach(item => {
        if (item.type === 'part' && item.part) {
          newParts.push(item.part);
        } else if (item.type === 'currency') {
          if (item.holosTokens) holosGained += item.holosTokens;
          if (item.gachaTickets) ticketsGained += item.gachaTickets;
        } else if (item.type === 'blueprint' && item.holobotKey && item.blueprintPieces) {
          blueprintsGained[item.holobotKey] = (blueprintsGained[item.holobotKey] || 0) + item.blueprintPieces;
        }
      });

      // Update user profile with new items
      const profileUpdates: any = {};
      
      if (newParts.length > 0) {
        profileUpdates.parts = [...(user.parts || []), ...newParts];
      }
      
      if (holosGained > 0) {
        profileUpdates.holosTokens = (user.holosTokens || 0) + holosGained;
      }
      
      if (ticketsGained > 0) {
        profileUpdates.gachaTickets = (user.gachaTickets || 0) + ticketsGained;
      }
      
      if (Object.keys(blueprintsGained).length > 0) {
        const currentBlueprints = user.blueprints || {};
        const updatedBlueprints = { ...currentBlueprints };
        Object.entries(blueprintsGained).forEach(([key, amount]) => {
          updatedBlueprints[key] = (updatedBlueprints[key] || 0) + amount;
        });
        profileUpdates.blueprints = updatedBlueprints;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateUser(profileUpdates);
      }

      toast.success(`${packConfig.name} opened! You received ${result.items.length} items!`);
    } catch (error) {
      console.error('Error opening pack:', error);
      toast.error('Failed to open pack. Please try again.');
    }
  };

  const handleEquipPart = (item: BoosterPackItem) => {
    if (item.type === 'part' && item.part) {
      // Close the pack animation first
      clearOpenResult();
      
      // Navigate to Holobots page where they can equip the part
      navigate('/holobots-info');
      
      toast.success(`${item.name} added to inventory! Go to Holobots page to equip it.`);
    }
  };

  const getRewardMethods = () => [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Daily Missions',
      description: 'Complete daily challenges to earn Gacha Tickets',
      reward: '1-3 Tickets/day'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Sync Training Streaks',
      description: 'Maintain training streaks for bonus rewards',
      reward: '5 Tickets/week'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: 'Arena Win Streaks',
      description: 'Win consecutive arena battles',
      reward: '10 Tickets/streak'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'League Victories',
      description: 'Advance through league tiers',
      reward: '25 Tickets/tier'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-4 text-shadow-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            BOOSTER PACKS
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Open collectible packs to discover rare Holobot parts, blueprint fragments, and valuable items!
          </p>
        </div>

        {/* User Currency Display */}
        {user && (
          <div className="flex justify-center space-x-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-400 border-2">
              <CardContent className="p-4 flex items-center space-x-3">
                <Coins className="w-6 h-6 text-yellow-200" />
                <div>
                  <p className="text-sm font-semibold text-yellow-200">HOLOS Tokens</p>
                  <p className="text-2xl font-black text-white">{user.holosTokens || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-400 border-2">
              <CardContent className="p-4 flex items-center space-x-3">
                <Ticket className="w-6 h-6 text-green-200" />
                <div>
                  <p className="text-sm font-semibold text-green-200">Gacha Tickets</p>
                  <p className="text-2xl font-black text-white">{user.gachaTickets || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/10">
            <TabsTrigger value="packs" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Packs</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>How to Earn</span>
            </TabsTrigger>
          </TabsList>

          {/* Packs Tab */}
          <TabsContent value="packs" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(BOOSTER_PACK_TYPES).map((packType) => (
                <BoosterPackCard
                  key={packType}
                  packType={packType as BoosterPackType}
                  onPurchase={handlePurchasePack}
                  disabled={isOpening}
                  userHolos={user?.holosTokens || 0}
                  userTickets={user?.gachaTickets || 0}
                />
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-8">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Pack Opening History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {openedPacks.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No packs opened yet</p>
                    <p className="text-gray-500">Open your first pack to see your history here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {openedPacks.slice(0, 10).map((pack) => (
                      <Card key={pack.packId} className="bg-gray-800/50 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg">{pack.packId.split('_')[0].toUpperCase()} Pack</h3>
                              <p className="text-sm text-gray-400">
                                {new Date(pack.openedAt).toLocaleDateString()} at {new Date(pack.openedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge variant="secondary">{pack.items.length} Items</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {pack.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded">
                                <span className="text-lg">{
                                  item.type === 'part' ? '⚙️' :
                                  item.type === 'blueprint' ? '📋' :
                                  item.type === 'currency' ? (item.holosTokens ? '🪙' : '🎫') :
                                  '🎁'
                                }</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{item.name}</p>
                                  <Badge variant="outline" className={`text-xs ${
                                    item.tier === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                    item.tier === 'epic' ? 'border-purple-400 text-purple-400' :
                                    item.tier === 'rare' ? 'border-blue-400 text-blue-400' :
                                    'border-gray-400 text-gray-400'
                                  }`}>
                                    {item.tier}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* How to Earn Tab */}
          <TabsContent value="rewards" className="mt-8">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>How to Earn Gacha Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getRewardMethods().map((method, index) => (
                    <Card key={index} className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-400/30">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-500/20 rounded-lg">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">{method.title}</h3>
                            <p className="text-gray-300 mb-3">{method.description}</p>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400/30">
                              {method.reward}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-400/30">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Pro Tips:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Save up tickets for Premium or Legendary packs for better rewards</li>
                    <li>• Complete daily missions consistently for steady ticket income</li>
                    <li>• Arena win streaks provide the highest ticket rewards</li>
                    <li>• Sync Training streaks are the most reliable source of weekly tickets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pack Opening Animation */}
      <PackOpeningAnimation
        result={currentOpenResult}
        isOpening={isOpening}
        onClose={clearOpenResult}
        onEquipPart={handleEquipPart}
      />
    </div>
  );
};

export default BoosterPacks; 