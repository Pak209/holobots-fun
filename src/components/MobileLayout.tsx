
import { useLocation, Link } from "react-router-dom";
import { Home, Dumbbell, Trophy, Robot, Gem, Gamepad2, Boxes } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="relative flex flex-col w-full min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-4 py-3 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border">
        <div className="text-xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content with padding for header and footer */}
      <main className="flex-1 pt-14 pb-16 w-full overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-16 flex justify-around items-center bg-card/80 backdrop-blur-md border-t border-border z-50">
        <Link to="/app" className="flex flex-col items-center justify-center w-1/6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full", 
              isActive("/app") && "bg-holobots-accent text-white"
            )}
          >
            <Home className="h-5 w-5" />
          </Button>
          <span className="text-[10px] mt-0.5">Battle</span>
        </Link>
        
        <Link to="/training" className="flex flex-col items-center justify-center w-1/6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full", 
              isActive("/training") && "bg-holobots-accent text-white"
            )}
          >
            <Dumbbell className="h-5 w-5" />
          </Button>
          <span className="text-[10px] mt-0.5">Train</span>
        </Link>
        
        <Link to="/quests" className="flex flex-col items-center justify-center w-1/6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full", 
              isActive("/quests") && "bg-holobots-accent text-white"
            )}
          >
            <Trophy className="h-5 w-5" />
          </Button>
          <span className="text-[10px] mt-0.5">Quests</span>
        </Link>
        
        <Link to="/gacha" className="flex flex-col items-center justify-center w-1/6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full", 
              isActive("/gacha") && "bg-holobots-accent text-white"
            )}
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
          <span className="text-[10px] mt-0.5">Gacha</span>
        </Link>
        
        <Link to="/user-items" className="flex flex-col items-center justify-center w-1/6">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full", 
              isActive("/user-items") && "bg-holobots-accent text-white"
            )}
          >
            <Boxes className="h-5 w-5" />
          </Button>
          <span className="text-[10px] mt-0.5">Items</span>
        </Link>
      </nav>
    </div>
  );
};
