import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export const NavigationMenu = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 right-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] bg-retro-background border-retro-accent">
        <nav className="flex flex-col gap-4 mt-8">
          <Link 
            to="/" 
            className="text-white hover:text-retro-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-retro-accent/50"
          >
            Battle
          </Link>
          <Link 
            to="/quests" 
            className="text-white hover:text-retro-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-retro-accent/50"
          >
            Quests
          </Link>
          <Link 
            to="/training" 
            className="text-white hover:text-retro-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-retro-accent/50"
          >
            Training
          </Link>
          <Link 
            to="/holobots-info" 
            className="text-white hover:text-retro-accent transition-colors px-4 py-2 rounded-md hover:bg-white/10 border border-retro-accent/50"
          >
            Holobots Info
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};