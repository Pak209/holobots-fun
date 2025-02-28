
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  LogOut, 
  User, 
  ChevronDown,
  Trophy,
  Battery,
  Coins,
  ShoppingBag
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
    <div className="flex items-center gap-2">
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
                <Trophy className="h-4 w-4 text-green-400" />
                <span>Win/Loss:</span>
              </div>
              <span className="font-semibold">{user?.stats.wins}/{user?.stats.losses}</span>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <Link to="/user-items">
            <DropdownMenuItem className="cursor-pointer">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>My Items</span>
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
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border">
          <nav className="flex flex-col gap-4 mt-8">
            <Link 
              to="/" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Battle
            </Link>
            <Link 
              to="/quests" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Quests
            </Link>
            <Link 
              to="/training" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Training
            </Link>
            <Link 
              to="/holobots-info" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Holobots Info
            </Link>
            <Link 
              to="/holos-farm" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Holos Farm
            </Link>
            <Link 
              to="/gacha" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              Gacha
            </Link>
            <Link 
              to="/user-items" 
              className="text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
            >
              My Items
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
