import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Coins, Zap, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardItem {
  rank: number;
  username: string;
  avatarUrl?: string;
  value: string | number;
}

const Leaderboard = () => {
  const [currentTab, setCurrentTab] = useState("battle");
  const [battleLeaders, setBattleLeaders] = useState<LeaderboardItem[]>([]);
  const [tokenLeaders, setTokenLeaders] = useState<LeaderboardItem[]>([]);
  const [levelLeaders, setLevelLeaders] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles with necessary data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, wins, losses, holos_tokens, holobots, player_rank')
        .order('wins', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched profiles:', profiles); // Debug log

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found, keeping mock data');
        return;
      }

      // Process battle leaders (show all users, even with 0 battles)
      const battleData = profiles
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
        })
        .slice(0, 10)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: `${profile.wins} - ${profile.losses}`
        }));

      // Process token leaders (show all users, even with 0 tokens)
      const tokenData = profiles
        .sort((a, b) => (b.holos_tokens || 0) - (a.holos_tokens || 0))
        .slice(0, 10)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: (profile.holos_tokens || 0).toLocaleString()
        }));

      // Process level leaders (calculate highest level holobot, show all users)
      const levelData = profiles
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
        .sort((a, b) => b.maxLevel - a.maxLevel)
        .slice(0, 10)
        .map((profile, index) => ({
          rank: index + 1,
          username: profile.username,
          value: `Level ${profile.maxLevel}`
        }));

      console.log('Battle leaders:', battleData);
      console.log('Token leaders:', tokenData);
      console.log('Level leaders:', levelData);

      setBattleLeaders(battleData);
      setTokenLeaders(tokenData);
      setLevelLeaders(levelData);

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
        return <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">#{rank}</span>;
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

  const renderLeaderboard = (leaders: LeaderboardItem[], valueLabel: string) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-holobots-background/20 dark:bg-holobots-dark-background/20 border border-holobots-border dark:border-holobots-dark-border rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (leaders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No players found</p>
          <p className="text-sm">Check back soon as more players join!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div 
            key={leader.rank}
            className={`
              flex items-center justify-between p-3 
              ${leader.rank <= 3 
                ? 'bg-holobots-background/50 dark:bg-holobots-dark-background/50 border-2 border-holobots-accent/30 dark:border-holobots-accent/30' 
                : 'bg-holobots-background/20 dark:bg-holobots-dark-background/20 border border-holobots-border dark:border-holobots-dark-border'
              }
              rounded-lg transition-all duration-200 hover:scale-[1.01]
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">{getRankIcon(leader.rank)}</div>
              <Avatar className="h-8 w-8 border border-holobots-border dark:border-holobots-dark-border">
                <AvatarImage src={leader.avatarUrl} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{leader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800 dark:text-gray-200">{leader.username}</span>
            </div>
            <div className="text-sm font-semibold text-holobots-accent dark:text-holobots-dark-accent">
              {leader.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-holobots-accent dark:text-holobots-dark-accent">
          LEADERBOARDS
        </h1>
        
        <Tabs defaultValue="battle" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="bg-holobots-background/60 p-1 text-gray-700 mb-6">
            <TabsTrigger value="battle" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent">Battle</TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent">Tokens</TabsTrigger>
            <TabsTrigger value="level" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent">Level</TabsTrigger>
          </TabsList>
          
          <Card className="bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl text-gray-800 dark:text-gray-200">
                {getLeaderboardIcon(currentTab)}
                {currentTab === "battle" && "Battle Champions"}
                {currentTab === "tokens" && "Token Masters"}
                {currentTab === "level" && "Level Leaders"}
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
