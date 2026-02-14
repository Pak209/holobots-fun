import { 
  LogOut, 
  User, 
  ChevronDown,
  Trophy,
  Battery,
  Coins,
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlayerRankCard } from './PlayerRankCard';
import React from 'react';
import { useSyncPointsStore } from '@/stores/syncPointsStore';

export const NavigationMenu = () => {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRefilling, setIsRefilling] = React.useState(false);
  const { getAvailableSyncPoints } = useSyncPointsStore();

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
        className="flex items-center gap-1 bg-[#1A1F2C] border-[#33C3F0] px-2 py-1 text-gray-200"
        onClick={() => navigate('/auth')}
      >
        <User className="h-4 w-4 text-[#33C3F0]" />
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
          className="flex items-center gap-1 bg-[#1A1F2C] border-[#33C3F0] px-2 py-1 text-gray-200"
        >
          <User className="h-4 w-4 text-[#33C3F0]" />
          <span className="mr-1">{user.username || 'User'}</span>
          <ChevronDown className="h-3 w-3 text-gray-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-black border-4 border-[#F5C400] text-white shadow-[0_0_30px_rgba(245,196,0,0.5)] p-0" style={{
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
      }}>
        <div className="p-3 space-y-2">
          <PlayerRankCard user={user} />
          
          {/* Daily Energy */}
          <div className="bg-gradient-to-r from-gray-900 to-black border-2 border-[#F5C400]/50 p-2" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-[#F5C400]" />
                <span className="text-sm font-bold uppercase tracking-wide">Daily Energy:</span>
              </div>
              <span className="font-black text-[#F5C400]">{user.dailyEnergy}/{user.maxDailyEnergy}</span>
            </div>
            
            <div className="flex items-center justify-between pl-6">
              <span className="text-xs text-gray-400">Refills: {user.energy_refills || 0}</span>
              <Button
                size="sm"
                className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-black px-3 py-1 text-xs uppercase tracking-wider disabled:opacity-50 border-2 border-black"
                style={{
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
                }}
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
          </div>
          
          {/* Holos Tokens */}
          <div className="bg-gradient-to-r from-gray-900 to-black border-2 border-[#F5C400]/50 p-2 flex items-center justify-between" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <div className="flex items-center gap-2">
              <img src="/src/assets/icons/HOlos.svg" alt="HOLOS" className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wide">Holos Tokens:</span>
            </div>
            <span className="font-black text-[#F5C400] text-lg">{user.holosTokens}</span>
          </div>
          
          {/* Sync Points */}
          <div className="bg-gradient-to-r from-gray-900 to-black border-2 border-[#F5C400]/50 p-2 flex items-center justify-between" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <div className="flex items-center gap-2">
              <img src="/src/assets/icons/SyncPoint.svg" alt="SP" className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wide">Sync Points:</span>
            </div>
            <span className="font-black text-[#F5C400] text-lg">{getAvailableSyncPoints()}</span>
          </div>
          
          {/* Win/Loss */}
          <div className="bg-gradient-to-r from-gray-900 to-black border-2 border-[#F5C400]/50 p-2 flex items-center justify-between" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#F5C400]" />
              <span className="text-sm font-bold uppercase tracking-wide">Win/Loss:</span>
            </div>
            <span className="font-black text-[#F5C400]">{user.stats.wins}/{user.stats.losses}</span>
          </div>
        </div>
        
        <div className="h-1 bg-[#F5C400]/30 mx-2"></div>
        
        <Link to="/leaderboard">
          <DropdownMenuItem className="cursor-pointer hover:bg-[#F5C400]/20 focus:bg-[#F5C400]/20 text-white font-bold uppercase tracking-wide mx-2 my-1" style={{
            clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
          }}>
            <Trophy className="mr-2 h-4 w-4 text-[#F5C400]" />
            <span>Leaderboard</span>
          </DropdownMenuItem>
        </Link>
        
        <div className="h-1 bg-[#F5C400]/30 mx-2"></div>
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer hover:bg-red-900/50 focus:bg-red-900/50 font-bold uppercase tracking-wide mx-2 my-1 mb-2" style={{
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
