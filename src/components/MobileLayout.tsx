import { useLocation, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/NavigationMenu";
import { DevModeToggle } from "@/components/DevModeToggle";
import { NavIcon } from "@/components/icons/NavIcon";
import BackgroundDetail from "@/assets/icons/BackgroundDetail.svg";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if user is on any arena-related page
  const isArenaActive = () => {
    return location.pathname === "/app" || 
           location.pathname === "/arena-v2" || 
           location.pathname.startsWith("/arena");
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-gradient-to-br from-[#DAA520] via-[#D4AF37] to-[#B8860B] overflow-hidden">
      {/* Background Detail Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${BackgroundDetail})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 h-20 relative">
        {/* Background SVG - Top Left Corner Only - Condensed */}
        <div className="absolute top-0 left-0 h-full max-w-xs pointer-events-none">
          <img 
            src="/icons/TopBackgroundComponent.svg" 
            alt="" 
            className="h-full w-auto object-cover scale-75 origin-left"
          />
          
          {/* HOLOBOTS Text - Navigation Link to Dashboard */}
          <div className="absolute inset-0 flex items-start pt-4 pl-8 pointer-events-auto">
            <Link to="/dashboard" className="relative z-10 text-2xl font-black italic tracking-wider text-white font-orbitron hover:text-gray-200 transition-colors drop-shadow-lg cursor-pointer">
              HOLOBOTS
            </Link>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-end px-4">
          <div className="flex items-center gap-4">
            <DevModeToggle />
            <NavigationMenu />
          </div>
        </div>
      </header>

      {/* Main Content with padding for header and footer */}
      <main className="relative z-10 flex-1 pt-20 pb-20 w-full overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Updated with 4 items and custom icons */}
      <nav className="fixed bottom-0 w-full h-20 flex justify-around items-center bg-black/90 backdrop-blur-sm border-t-4 border-[#DAA520] z-50 shadow-2xl">
        {/* Arena */}
        <Link to="/app" className="flex flex-col items-center justify-center flex-1 gap-1">
          <div className={cn(
            "flex items-center justify-center", 
            isArenaActive() ? "scale-110" : ""
          )}>
            <NavIcon 
              iconName="arena" 
              isActive={isArenaActive()}
              className="h-14 w-20 object-contain"
            />
          </div>
          <span className={cn(
            "text-[10px] font-medium font-orbitron",
            isArenaActive() ? "text-[#DAA520]" : "text-gray-400"
          )}>Arena</span>
        </Link>
        
        {/* Inventory */}
        <Link to="/inventory" className="flex flex-col items-center justify-center flex-1 gap-1">
          <div className={cn(
            "flex items-center justify-center", 
            isActive("/inventory") ? "scale-110" : ""
          )}>
            <NavIcon 
              iconName="dashboard" 
              isActive={isActive("/inventory")}
              className="h-12 w-12"
            />
          </div>
          <span className={cn(
            "text-[10px] font-medium font-orbitron",
            isActive("/inventory") ? "text-[#DAA520]" : "text-gray-400"
          )}>Inventory</span>
        </Link>
        
        {/* Sync */}
        <Link to="/sync" className="flex flex-col items-center justify-center flex-1 gap-1">
          <div className={cn(
            "flex items-center justify-center", 
            isActive("/sync") ? "scale-110" : ""
          )}>
            <NavIcon 
              iconName="sync" 
              isActive={isActive("/sync")}
              className="h-12 w-12"
            />
          </div>
          <span className={cn(
            "text-[10px] font-medium font-orbitron",
            isActive("/sync") ? "text-[#DAA520]" : "text-gray-400"
          )}>Sync</span>
        </Link>
        
        {/* Marketplace */}
        <Link to="/marketplace" className="flex flex-col items-center justify-center flex-1 gap-1">
          <div className={cn(
            "flex items-center justify-center", 
            isActive("/marketplace") ? "scale-110" : ""
          )}>
            <NavIcon 
              iconName="marketplace" 
              isActive={isActive("/marketplace")}
              className="h-12 w-12"
            />
          </div>
          <span className={cn(
            "text-[10px] font-medium font-orbitron",
            isActive("/marketplace") ? "text-[#DAA520]" : "text-gray-400"
          )}>Market</span>
        </Link>
      </nav>
    </div>
  );
};
