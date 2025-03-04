
import { 
  LogOut, 
  User, 
  ChevronDown,
  Trophy,
  Battery,
  Coins,
  ShoppingBag,
  Database,
  BarChart4,
  Wheat,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const NavigationMenu = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 bg-background/90 border-holobots-accent px-2 py-1"
        >
          <User className="h-4 w-4 text-holobots-accent" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border">
        <DropdownMenuLabel className="text-center font-bold">{user?.username || 'Guest User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-blue-400" />
              <span>Daily Energy:</span>
            </div>
            <span className="font-semibold">{user?.dailyEnergy}/{user?.maxDailyEnergy}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span>Holos Tokens:</span>
            </div>
            <span className="font-semibold">{user?.holosTokens}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Arena Passes:</span>
            </div>
            <span className="font-semibold">{user?.arena_passes || 0}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-400" />
              <span>Win/Loss:</span>
            </div>
            <span className="font-semibold">{user?.stats.wins}/{user?.stats.losses}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <Link to="/holobots-info">
          <DropdownMenuItem className="cursor-pointer">
            <Database className="mr-2 h-4 w-4" />
            <span>Holobots Info</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/marketplace">
          <DropdownMenuItem className="cursor-pointer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Marketplace</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/leaderboard">
          <DropdownMenuItem className="cursor-pointer">
            <BarChart4 className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/holos-farm">
          <DropdownMenuItem className="cursor-pointer">
            <Wheat className="mr-2 h-4 w-4" />
            <span>Holos Farm</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <div className="p-2 flex justify-center">
          <ThemeToggle />
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
