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
  Award,
  Package,
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlayerRankCard } from './PlayerRankCard';
import React from 'react';

export const NavigationMenu = () => {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRefilling, setIsRefilling] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const handleRefill = async () => {
    if (!user || (user.energy_refills || 0) <= 0) {
      toast({
        title: 'No Energy Refills',
        description: "You don't have any Energy Refills to use.",
        variant: 'destructive',
      });
      return;
    }
    setIsRefilling(true);
    try {
      await updateUser({
        energy_refills: (user.energy_refills || 0) - 1,
        dailyEnergy: user.maxDailyEnergy,
      });
      toast({
        title: 'Energy Refilled',
        description: 'Your daily energy has been restored to full!',
      });
    } catch (error) {
      toast({
        title: 'Refill Failed',
        description: 'Could not refill energy. Try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefilling(false);
    }
  };

  // If user is not logged in, show login button
  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 bg-background/90 border-holobots-accent px-2 py-1 text-gray-700"
        onClick={() => navigate('/auth')}
      >
        <User className="h-4 w-4 text-holobots-accent" />
        <span>Sign In</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 bg-background/90 dark:bg-holobots-dark-card border-holobots-accent dark:border-holobots-dark-accent px-2 py-1 text-gray-700 dark:text-gray-200"
        >
          <User className="h-4 w-4 text-holobots-accent dark:text-holobots-dark-accent" />
          <span className="mr-1">{user.username || 'User'}</span>
          <ChevronDown className="h-3 w-3 text-gray-700 dark:text-gray-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border text-gray-700 dark:text-gray-300">
        <DropdownMenuLabel className="text-center font-bold">{user.username || 'User'}</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-holobots-border dark:border-holobots-dark-border" />
        
        <div className="p-2 space-y-2">
          <PlayerRankCard user={user} />
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-holobots-accent dark:text-holobots-dark-accent" />
              <span>Daily Energy:</span>
            </div>
            <span className="font-semibold">{user.dailyEnergy}/{user.maxDailyEnergy}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1 pl-7">
            <span className="text-xs text-gray-500 dark:text-gray-400">Available Refills: {user.energy_refills || 0}</span>
            <Button
              size="sm"
              className="ml-2 bg-[#33C3F0] hover:bg-[#0FA0CE] text-black font-semibold px-2 py-0.5 rounded disabled:opacity-50"
              onClick={handleRefill}
              disabled={isRefilling || (user.energy_refills || 0) <= 0 || user.dailyEnergy === user.maxDailyEnergy}
              aria-label="Refill Daily Energy"
            >
              {isRefilling ? (
                <>
                  <Zap className="h-3 w-3 mr-1 animate-pulse" />
                  Refilling...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Quick Refill
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-holobots-accent dark:text-holobots-dark-accent" />
              <span>Holos Tokens:</span>
            </div>
            <span className="font-semibold">{user.holosTokens}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              <span>Gacha Tickets:</span>
            </div>
            <span className="font-semibold">{user.gachaTickets || 0}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-holobots-accent dark:text-holobots-dark-accent" />
              <span>Arena Passes:</span>
            </div>
            <span className="font-semibold">{user.arena_passes || 0}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-holobots-accent dark:text-holobots-dark-accent" />
              <span>Win/Loss:</span>
            </div>
            <span className="font-semibold">{user.stats.wins}/{user.stats.losses}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator className="border-holobots-border dark:border-holobots-dark-border" />
        
        <Link to="/holobots-info">
          <DropdownMenuItem className="cursor-pointer focus:bg-holobots-hover dark:focus:bg-holobots-dark-hover focus:text-holobots-accent dark:focus:text-holobots-dark-accent">
            <Database className="mr-2 h-4 w-4" />
            <span>Holobots Info</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/gacha?tab=items">
          <DropdownMenuItem className="cursor-pointer focus:bg-holobots-hover dark:focus:bg-holobots-dark-hover focus:text-holobots-accent dark:focus:text-holobots-dark-accent">
            <Package className="mr-2 h-4 w-4" />
            <span>Your Items</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/booster-packs">
          <DropdownMenuItem className="cursor-pointer focus:bg-holobots-hover dark:focus:bg-holobots-dark-hover focus:text-holobots-accent dark:focus:text-holobots-dark-accent">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Booster Packs</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/leaderboard">
          <DropdownMenuItem className="cursor-pointer focus:bg-holobots-hover dark:focus:bg-holobots-dark-hover focus:text-holobots-accent dark:focus:text-holobots-dark-accent">
            <BarChart4 className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/holos-farm">
          <DropdownMenuItem className="cursor-pointer focus:bg-holobots-hover dark:focus:bg-holobots-dark-hover focus:text-holobots-accent dark:focus:text-holobots-dark-accent">
            <Wheat className="mr-2 h-4 w-4" />
            <span>Holos Farm</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="border-holobots-border dark:border-holobots-dark-border" />
        
        <div className="p-2 flex justify-center">
          <ThemeToggle />
        </div>
        
        <DropdownMenuSeparator className="border-holobots-border dark:border-holobots-dark-border" />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 cursor-pointer focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-600 dark:focus:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
