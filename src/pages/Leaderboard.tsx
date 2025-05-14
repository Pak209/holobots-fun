import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Coins, Zap, Medal } from "lucide-react";

interface LeaderboardItem {
  rank: number;
  username: string;
  avatarUrl?: string;
  value: string | number;
}

const Leaderboard = () => {
  const [currentTab, setCurrentTab] = useState("battle");
  
  const battleLeaders: LeaderboardItem[] = [
    { rank: 1, username: "CryptoKing", avatarUrl: "/lovable-uploads/8d33b0c2-676e-40c9-845e-8d81095085d1.png", value: "254 - 12" },
    { rank: 2, username: "NFTHunter", avatarUrl: "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png", value: "201 - 18" },
    { rank: 3, username: "BlockMaster", avatarUrl: "/lovable-uploads/ae1e648c-596d-49d0-b944-27cdf423a7e1.png", value: "195 - 26" },
    { rank: 4, username: "HoloQueen", value: "182 - 34" },
    { rank: 5, username: "PhantomGamer", value: "173 - 31" },
    { rank: 6, username: "CyberSamurai", value: "162 - 46" },
    { rank: 7, username: "MintMaster", value: "154 - 54" },
    { rank: 8, username: "TokenTrader", value: "147 - 63" },
    { rank: 9, username: "WalletWarrior", value: "142 - 59" },
    { rank: 10, username: "ChainChampion", value: "139 - 72" },
  ];
  
  const tokenLeaders: LeaderboardItem[] = [
    { rank: 1, username: "CryptoKing", avatarUrl: "/lovable-uploads/8d33b0c2-676e-40c9-845e-8d81095085d1.png", value: "245,678" },
    { rank: 2, username: "NFTHunter", avatarUrl: "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png", value: "198,432" },
    { rank: 3, username: "BlockMaster", avatarUrl: "/lovable-uploads/ae1e648c-596d-49d0-b944-27cdf423a7e1.png", value: "156,789" },
    { rank: 4, username: "HoloQueen", value: "132,654" },
    { rank: 5, username: "PhantomGamer", value: "120,987" },
    { rank: 6, username: "CyberSamurai", value: "108,765" },
    { rank: 7, username: "MintMaster", value: "98,432" },
    { rank: 8, username: "TokenTrader", value: "87,654" },
    { rank: 9, username: "WalletWarrior", value: "76,543" },
    { rank: 10, username: "ChainChampion", value: "65,432" },
  ];
  
  const levelLeaders: LeaderboardItem[] = [
    { rank: 1, username: "CryptoKing", avatarUrl: "/lovable-uploads/8d33b0c2-676e-40c9-845e-8d81095085d1.png", value: "Level 85" },
    { rank: 2, username: "NFTHunter", avatarUrl: "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png", value: "Level 82" },
    { rank: 3, username: "BlockMaster", avatarUrl: "/lovable-uploads/ae1e648c-596d-49d0-b944-27cdf423a7e1.png", value: "Level 79" },
    { rank: 4, username: "HoloQueen", value: "Level 76" },
    { rank: 5, username: "PhantomGamer", value: "Level 74" },
    { rank: 6, username: "CyberSamurai", value: "Level 72" },
    { rank: 7, username: "MintMaster", value: "Level 70" },
    { rank: 8, username: "TokenTrader", value: "Level 68" },
    { rank: 9, username: "WalletWarrior", value: "Level 67" },
    { rank: 10, username: "ChainChampion", value: "Level 65" },
  ];

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

  const renderLeaderboard = (leaders: LeaderboardItem[], valueLabel: string) => (
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

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-holobots-accent dark:text-holobots-dark-accent">
          LEADERBOARDS
        </h1>
        
        <Tabs defaultValue="battle" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <TabsTrigger value="battle" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent dark:data-[state=active]:bg-holobots-dark-card dark:data-[state=active]:text-holobots-dark-accent">Battle</TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent dark:data-[state=active]:bg-holobots-dark-card dark:data-[state=active]:text-holobots-dark-accent">Tokens</TabsTrigger>
            <TabsTrigger value="level" className="data-[state=active]:bg-holobots-card data-[state=active]:text-holobots-accent dark:data-[state=active]:bg-holobots-dark-card dark:data-[state=active]:text-holobots-dark-accent">Level</TabsTrigger>
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
