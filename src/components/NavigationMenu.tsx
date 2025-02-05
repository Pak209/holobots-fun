
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const NavigationMenu = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] bg-holobots-card dark:bg-holobots-dark-card border-holobots-border dark:border-holobots-dark-border">
        <div className="flex items-center justify-between mb-6 mt-2">
          <span className="text-xl font-bold italic bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
            HOLOBOTS
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-holobots-text dark:text-holobots-dark-text"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
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
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-holobots-text dark:text-holobots-dark-text hover:text-holobots-accent dark:hover:text-holobots-dark-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-holobots-border dark:border-holobots-dark-border"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
