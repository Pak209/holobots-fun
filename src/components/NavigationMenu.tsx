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
  Package
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
        className="flex items-center gap-1 bg-background/90 border-holobots-accent px-2 py-1"
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
          className="flex items-center gap-1 bg-background/90 border-holobots-accent px-2 py-1"
        >
          <User className="h-4 w-4 text-holobots-accent" />
          <span className="mr-1">{user.username || 'User'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border">
        <DropdownMenuLabel className="text-center font-bold">{user.username || 'User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-2">
          <PlayerRankCard user={user} />
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-blue-400" />
              <span>Daily Energy:</span>
            </div>
            <span className="font-semibold">{user.dailyEnergy}/{user.maxDailyEnergy}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1 pl-7">
            <span className="text-xs text-gray-400">Available Refills: {user.energy_refills || 0}</span>
            <Button
              size="sm"
              className="ml-2 bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-0.5 rounded"
              onClick={handleRefill}
              disabled={isRefilling || (user.energy_refills || 0) <= 0 || user.dailyEnergy === user.maxDailyEnergy}
              aria-label="Refill Daily Energy"
            >
              {isRefilling ? 'Refilling...' : 'Refill'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span>Holos Tokens:</span>
            </div>
            <span className="font-semibold">{user.holosTokens}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Arena Passes:</span>
            </div>
            <span className="font-semibold">{user.arena_passes || 0}</span>
          </div>
          
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-400" />
              <span>Win/Loss:</span>
            </div>
            <span className="font-semibold">{user.stats.wins}/{user.stats.losses}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <Link to="/holobots-info">
          <DropdownMenuItem className="cursor-pointer">
            <Database className="mr-2 h-4 w-4" />
            <span>Holobots Info</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/gacha?tab=items">
          <DropdownMenuItem className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Your Items</span>
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
