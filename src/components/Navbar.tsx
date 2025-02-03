import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = () => (
    <>
      <Link to="#features">
        <Button variant="ghost" className="text-holobots-text hover:text-holobots-accent text-sm">Features</Button>
      </Link>
      <Link to="#how-it-works">
        <Button variant="ghost" className="text-holobots-text hover:text-holobots-accent text-sm">How It Works</Button>
      </Link>
      <Link to="#login">
        <Button variant="outline" className="text-holobots-text hover:text-holobots-accent border-holobots-border text-sm">Login</Button>
      </Link>
      <Link to="#signup">
        <Button className="bg-holobots-accent hover:bg-holobots-hover text-white text-sm">Launch App</Button>
      </Link>
    </>
  );

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-holobots-background/95 backdrop-blur supports-[backdrop-filter]:bg-holobots-background/60 border-b border-holobots-border" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <div className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover animate-neon-pulse">
            Holobots
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-holobots-text">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-holobots-background border-holobots-border w-[280px] p-4">
              <div className="flex flex-col gap-3 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}