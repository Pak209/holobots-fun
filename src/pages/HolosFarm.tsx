import { NavigationMenu } from "@/components/NavigationMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Coins, Trophy, ChevronRight } from "lucide-react";

const HolosFarm = () => {
  const { toast } = useToast();

  const handleStake = () => {
    toast({
      title: "Coming Soon",
      description: "Staking functionality will be available once smart contracts are deployed.",
    });
  };

  return (
    <div className="min-h-screen bg-holobots-background text-holobots-text p-4">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          HOLOS FARMING
        </h1>

        {/* Farming Pools Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-holobots-card border-holobots-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-holobots-accent">
                <Coins className="h-5 w-5" />
                Solana Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">APR: 120%</div>
                <div className="text-sm">Total Staked: 1,234 SOL</div>
                <div className="text-sm">Your Stake: 0 SOL</div>
                <Button 
                  onClick={handleStake}
                  className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                >
                  Stake SOL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-holobots-card border-holobots-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-holobots-accent">
                <Coins className="h-5 w-5" />
                ETH Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">APR: 90%</div>
                <div className="text-sm">Total Staked: 156 ETH</div>
                <div className="text-sm">Your Stake: 0 ETH</div>
                <Button 
                  onClick={handleStake}
                  className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                >
                  Stake ETH
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-holobots-card border-holobots-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-holobots-accent">
                <Coins className="h-5 w-5" />
                wBTC Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">APR: 75%</div>
                <div className="text-sm">Total Staked: 12 wBTC</div>
                <div className="text-sm">Your Stake: 0 wBTC</div>
                <Button 
                  onClick={handleStake}
                  className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                >
                  Stake wBTC
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Minting Section */}
        <Card className="bg-holobots-card border-holobots-border shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-holobots-accent">
              <Trophy className="h-5 w-5" />
              Legendary Holobots NFT Minting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-sm">Available Legendary NFTs: 982/1000</div>
                <div className="text-sm">Current Minting Cost: 1000 HOLOS</div>
                <div className="text-sm">Legendary Chance: 12%</div>
                <Button 
                  onClick={handleStake}
                  className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                >
                  Mint Holobot NFT
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold mb-2">Minting Progress</div>
                <div className="h-2 bg-holobots-border rounded-full overflow-hidden">
                  <div className="h-full w-[18%] bg-holobots-accent" />
                </div>
                <div className="text-xs opacity-70">182/1000 Legendary NFTs Minted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Section */}
        <Card className="bg-holobots-card border-holobots-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-holobots-accent">
              <Trophy className="h-5 w-5" />
              Top Farmers Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { rank: 1, name: "CryptoKing", holos: "245,678" },
                { rank: 2, name: "NFTHunter", holos: "198,432" },
                { rank: 3, name: "BlockMaster", holos: "156,789" },
              ].map((player) => (
                <div 
                  key={player.rank}
                  className="flex items-center justify-between p-3 bg-holobots-background rounded-lg border border-holobots-border"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-holobots-accent">#{player.rank}</span>
                    <span>{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{player.holos} HOLOS</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HolosFarm;