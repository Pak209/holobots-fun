
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Search, Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PlayerSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchPlayers, user } = useAuth();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 3 characters to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlayers(searchQuery);
      setSearchResults(results.filter(player => player.id !== user?.id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for players",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChallenge = (opponent: UserProfile) => {
    // TODO: Implement challenge functionality
    toast({
      title: "Challenge sent",
      description: `Challenge sent to ${opponent.username}`,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-holobots-card border-holobots-border">
      <CardHeader>
        <CardTitle>Find Players</CardTitle>
        <CardDescription>Search for players to challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-black/30 border-holobots-border"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-holobots-accent hover:bg-holobots-hover"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="space-y-2">
          {searchResults.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 rounded-lg border border-holobots-border bg-black/20"
            >
              <div>
                <p className="font-medium">{player.username}</p>
                <p className="text-sm text-gray-400">
                  W: {player.stats.wins} L: {player.stats.losses}
                </p>
              </div>
              <Button
                onClick={() => handleChallenge(player)}
                variant="outline"
                className="border-holobots-accent hover:bg-holobots-accent/20"
              >
                <Swords className="w-4 h-4 mr-2" />
                Challenge
              </Button>
            </div>
          ))}
          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-center text-gray-400">No players found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
