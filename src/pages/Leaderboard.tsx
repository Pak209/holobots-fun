import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Coins, Zap, Medal, User, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface LeaderboardItem {
  rank: number;
  username: string;
  avatarUrl?: string;
  value: string | number;
}

interface UserPosition {
  rank: number;
  username: string;
  value: string | number;
  totalPlayers: number;
}

const Leaderboard = () => {
  const [currentTab, setCurrentTab] = useState("battle");
  const [battleLeaders, setBattleLeaders] = useState<LeaderboardItem[]>([]);
  const [tokenLeaders, setTokenLeaders] = useState<LeaderboardItem[]>([]);
  const [levelLeaders, setLevelLeaders] = useState<LeaderboardItem[]>([]);
  const [userBattlePosition, setUserBattlePosition] = useState<UserPosition | null>(null);
  const [userTokenPosition, setUserTokenPosition] = useState<UserPosition | null>(null);
  const [userLevelPosition, setUserLevelPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
  }, [user]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // First try the normal query
      console.log('Fetching all profiles from database...');
      let { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, wins, losses, holos_tokens, holobots, player_rank, id, created_at')
        .order('created_at', { ascending: false });

      // Log the query results
      console.log('Direct query error:', error);
      console.log('Direct query result count:', profiles?.length || 0);
      
      if (error) {
        console.error('Error fetching leaderboard data:', error);
        toast({
          title: "Database Error",
          description: "Failed to load leaderboard data. This may be due to database permissions.",
          variant: "destructive"
        });
        return;
      }

      console.log(`Found ${profiles?.length || 0} total profiles:`, profiles);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found in database');
        return;
      }

      // Log each profile to see what data we have, especially looking for duplicates
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          username: profile.username,
          wins: profile.wins,
          losses: profile.losses,
          holos_tokens: profile.holos_tokens,
          holobots_count: Array.isArray(profile.holobots) ? profile.holobots.length : 0,
          id: profile.id
        });
      });

      // Check for duplicate usernames
      const usernameCounts = profiles.reduce((acc: Record<string, number>, profile) => {
        const username = profile.username?.toLowerCase();
        if (username) {
          acc[username] = (acc[username] || 0) + 1;
        }
        return acc;
      }, {});
      
      console.log('Username duplicate check:', usernameCounts);
      
      // Filter out duplicate usernames, keeping the one with more data (wins/losses/tokens)
      const deduplicatedProfiles = profiles.filter((profile, index, array) => {
        const username = profile.username?.toLowerCase();
        if (!username) return false;
        
        // If this username appears only once, keep it
        if (usernameCounts[username] === 1) return true;
        
        // If this username appears multiple times, keep the one with the most activity
        const duplicates = array.filter(p => p.username?.toLowerCase() === username);
        const bestProfile = duplicates.reduce((best, current) => {
          const bestScore = (best.wins || 0) + (best.losses || 0) + (best.holos_tokens || 0);
          const currentScore = (current.wins || 0) + (current.losses || 0) + (current.holos_tokens || 0);
          return currentScore > bestScore ? current : best;
        });
        
        return profile.id === bestProfile.id;
      });
      
      console.log(`Removed ${profiles.length - deduplicatedProfiles.length} duplicate profiles`);
      profiles = deduplicatedProfiles;

      // Process battle leaders data - ensure we handle null/undefined values properly
      const battleData = profiles
        .filter(profile => profile.username) // Only include profiles with usernames
        .map(profile => ({
          username: profile.username,
          wins: profile.wins || 0,
          losses: profile.losses || 0,
          totalBattles: (profile.wins || 0) + (profile.losses || 0),
          winRate: (profile.wins || 0) > 0 ? (profile.wins || 0) / ((profile.wins || 0) + (profile.losses || 0)) : 0
        }))
        .sort((a, b) => {
          // First sort by total battles, then by wins, then by win rate
          if (b.totalBattles !== a.totalBattles) return b.totalBattles - a.totalBattles;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.winRate - a.winRate;
        });

      console.log(`Processed ${battleData.length} battle profiles:`, battleData);

      // Find current user's battle position
      let currentUserBattlePosition: UserPosition | null = null;
      if (user?.username) {
        console.log(`Looking for user "${user.username}" in battle data...`);
        const userIndex = battleData.findIndex(p => p.username === user.username);
        console.log(`User found at index: ${userIndex}`);
        if (userIndex !== -1) {
          const userData = battleData[userIndex];
          currentUserBattlePosition = {
            rank: userIndex + 1,
            username: userData.username,
            value: `${userData.wins} - ${userData.losses}`,
            totalPlayers: battleData.length
          };
          console.log('User battle position:', currentUserBattlePosition);
        } else {
          console.log('User not found in battle data');
        }
      }

      // Get top performers for display (show top 20)
      const topBattleLeaders = battleData
        .slice(0, 20)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: `${profile.wins} - ${profile.losses}`
        }));

      // Process token leaders data
      const tokenData = profiles
        .filter(profile => profile.username) // Only include profiles with usernames
        .sort((a, b) => (b.holos_tokens || 0) - (a.holos_tokens || 0));

      console.log(`Processed ${tokenData.length} token profiles`);

      // Find current user's token position
      let currentUserTokenPosition: UserPosition | null = null;
      if (user?.username) {
        const userIndex = tokenData.findIndex(p => p.username === user.username);
        if (userIndex !== -1) {
          const userData = tokenData[userIndex];
          currentUserTokenPosition = {
            rank: userIndex + 1,
            username: userData.username,
            value: (userData.holos_tokens || 0).toLocaleString(),
            totalPlayers: tokenData.length
          };
        }
      }

      // Get top token performers
      const topTokenLeaders = tokenData
        .slice(0, 20)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: (profile.holos_tokens || 0).toLocaleString()
        }));

      // Process level leaders data
      const levelData = profiles
        .filter(profile => profile.username) // Only include profiles with usernames
        .map(profile => {
          let maxLevel = 1;
          if (profile.holobots && Array.isArray(profile.holobots)) {
            const levels = profile.holobots.map((h: any) => h.level || 1);
            if (levels.length > 0) {
              maxLevel = Math.max(...levels);
            }
          }
          return {
            username: profile.username,
            maxLevel
          };
        })
        .sort((a, b) => b.maxLevel - a.maxLevel);

      console.log(`Processed ${levelData.length} level profiles`);

      // Find current user's level position
      let currentUserLevelPosition: UserPosition | null = null;
      if (user?.username) {
        const userIndex = levelData.findIndex(p => p.username === user.username);
        if (userIndex !== -1) {
          const userData = levelData[userIndex];
          currentUserLevelPosition = {
            rank: userIndex + 1,
            username: userData.username,
            value: `Level ${userData.maxLevel}`,
            totalPlayers: levelData.length
          };
        }
      }

      // Get top level performers
      const topLevelLeaders = levelData
        .slice(0, 20)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: `Level ${profile.maxLevel}`
        }));

      console.log('Final results:', {
        battleLeaders: topBattleLeaders.length,
        tokenLeaders: topTokenLeaders.length,
        levelLeaders: topLevelLeaders.length,
        userPositions: { 
          battle: currentUserBattlePosition, 
          token: currentUserTokenPosition, 
          level: currentUserLevelPosition 
        }
      });

      setBattleLeaders(topBattleLeaders);
      setTokenLeaders(topTokenLeaders);
      setLevelLeaders(topLevelLeaders);
      setUserBattlePosition(currentUserBattlePosition);
      setUserTokenPosition(currentUserTokenPosition);
      setUserLevelPosition(currentUserLevelPosition);

    } catch (error) {
      console.error('Error in fetchLeaderboardData:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm font-medium text-gray-400">#{rank}</span>;
    }
  };

  const getLeaderboardIcon = (tab: string) => {
    switch (tab) {
      case "battle":
        return <Trophy className="h-5 w-5 mr-2 text-yellow-500" />;
      case "tokens":
        return <Coins className="h-5 w-5 mr-2 text-amber-500" />;
      case "level":
        return <Zap className="h-5 w-5 mr-2 text-blue-500" />;
      default:
        return <Trophy className="h-5 w-5 mr-2 text-yellow-500" />;
    }
  };

  const renderUserPosition = (userPosition: UserPosition | null) => {
    if (!userPosition || !user) return null;

    return (
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-2 border-cyan-500/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Your Position</span>
              </div>
              <div className="w-8 flex justify-center">{getRankIcon(userPosition.rank)}</div>
              <Avatar className="h-8 w-8 border border-cyan-500">
                <AvatarFallback className="bg-cyan-900 text-cyan-100">{userPosition.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-bold text-white">{userPosition.username}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-cyan-400">
                {userPosition.value}
              </div>
              <div className="text-xs text-gray-400">
                {userPosition.rank} of {userPosition.totalPlayers}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLeaderboard = (leaders: LeaderboardItem[], valueLabel: string) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#374151]/20 border border-[#374151] rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded"></div>
                <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (leaders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">No players found</p>
          <p className="text-sm">Check back soon as more players join!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaders.map((leader) => {
          const isCurrentUser = user?.username === leader.username;
          
          return (
            <div 
              key={leader.rank}
              className={`
                flex items-center justify-between p-3 
                ${isCurrentUser 
                  ? 'bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-2 border-cyan-500/50' 
                  : leader.rank <= 3 
                    ? 'bg-[#374151]/50 border-2 border-[#33C3F0]/30' 
                    : 'bg-[#374151]/20 border border-[#374151]'
                }
                rounded-lg transition-all duration-200 hover:scale-[1.01]
              `}
            >
              <div className="flex items-center gap-3">
                {isCurrentUser && (
                  <User className="h-4 w-4 text-cyan-400" />
                )}
                <div className="w-8 flex justify-center">{getRankIcon(leader.rank)}</div>
                <Avatar className={`h-8 w-8 border ${isCurrentUser ? 'border-cyan-500' : 'border-[#374151]'}`}>
                  <AvatarImage src={leader.avatarUrl} />
                  <AvatarFallback className={`${isCurrentUser ? 'bg-cyan-900 text-cyan-100' : 'bg-gray-700 text-gray-300'}`}>{leader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className={`font-medium ${isCurrentUser ? 'text-cyan-100 font-bold' : 'text-gray-200'}`}>
                  {leader.username}
                  {isCurrentUser && <span className="text-cyan-400 ml-2">(You)</span>}
                </span>
              </div>
              <div className={`text-sm font-semibold ${isCurrentUser ? 'text-cyan-400' : 'text-cyan-300'}`}>
                {leader.value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getCurrentUserPosition = () => {
    switch (currentTab) {
      case "battle":
        return userBattlePosition;
      case "tokens":
        return userTokenPosition;
      case "level":
        return userLevelPosition;
      default:
        return userBattlePosition;
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#33C3F0]">
          LEADERBOARDS
        </h1>
        
        <Tabs defaultValue="battle" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="bg-[#374151] p-1 text-gray-300 mb-6">
            <TabsTrigger value="battle" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">Battle</TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">Tokens</TabsTrigger>
            <TabsTrigger value="level" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">Level</TabsTrigger>
          </TabsList>
          
          {/* Show user's position at the top */}
          {renderUserPosition(getCurrentUserPosition())}
          
          <Card className="bg-[#1A1F2C] border-[#374151] shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-gray-200">
                {getLeaderboardIcon(currentTab)}
                {currentTab === "battle" && "Battle Champions"}
                {currentTab === "tokens" && "Token Masters"}
                {currentTab === "level" && "Level Leaders"}
                <span className="ml-auto text-sm font-normal text-gray-400">Top 20 Players</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="battle" className="mt-0">
                {renderLeaderboard(battleLeaders, "W - L")}
              </TabsContent>
              
              <TabsContent value="tokens" className="mt-0">
                {renderLeaderboard(tokenLeaders, "HOLOS")}
              </TabsContent>
              
              <TabsContent value="level" className="mt-0">
                {renderLeaderboard(levelLeaders, "LVL")}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;
