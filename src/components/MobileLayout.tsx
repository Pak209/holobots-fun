import { useLocation, Link } from "react-router-dom";
import { Home, Dumbbell, Trophy, Bot, Gem, ShoppingBag, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/NavigationMenu";
import { DevModeToggle } from "@/components/DevModeToggle";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#1A1F2C]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-4 py-3 bg-[#1A1F2C]/95 backdrop-blur-md border-b border-cyan-900/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Link to="/dashboard" className="text-xl font-bold italic tracking-wider text-cyan-400 font-orbitron hover:text-cyan-300 transition-colors">
              HOLOBOTS
            </Link>
            <DevModeToggle />
          </div>
          <NavigationMenu />
        </div>
      </header>

      {/* Main Content with padding for header and footer */}
      <main className="flex-1 pt-14 pb-16 w-full overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-16 flex justify-around items-center bg-[#111520] border-t border-cyan-900/30 z-50">
        <Link to="/app" className="flex flex-col items-center justify-center flex-1">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            isActive("/app") ? "bg-cyan-500 text-white" : "text-gray-400"
          )}>
            <Home className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5",
            isActive("/app") ? "text-white" : "text-gray-400"
          )}>Battle</span>
        </Link>
        
        <Link to="/training" className="flex flex-col items-center justify-center flex-1">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            isActive("/training") ? "bg-cyan-500 text-white" : "text-gray-400"
          )}>
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5",
            isActive("/training") ? "text-white" : "text-gray-400"
          )}>Train</span>
        </Link>
        
        <Link to="/quests" className="flex flex-col items-center justify-center flex-1">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            isActive("/quests") ? "bg-cyan-500 text-white" : "text-gray-400"
          )}>
            <Trophy className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5",
            isActive("/quests") ? "text-white" : "text-gray-400"
          )}>Quests</span>
        </Link>
        
        <Link to="/fitness" className="flex flex-col items-center justify-center flex-1">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            isActive("/fitness") ? "bg-cyan-500 text-white" : "text-gray-400"
          )}>
            <Activity className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5",
            isActive("/fitness") ? "text-white" : "text-gray-400"
          )}>Fitness</span>
        </Link>
        
        <Link to="/marketplace" className="flex flex-col items-center justify-center flex-1">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            isActive("/marketplace") ? "bg-cyan-500 text-white" : "text-gray-400"
          )}>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5",
            isActive("/marketplace") ? "text-white" : "text-gray-400"
          )}>Market</span>
        </Link>
      </nav>
    </div>
  );
};
