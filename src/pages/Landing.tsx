
import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import WordCycler from "@/components/WordCycler";
import { Characters } from "@/components/Characters";
import { useEffect, useRef } from "react";

const Landing = () => {
  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure Spline viewer is properly initialized
    const splineScript = document.createElement('script');
    splineScript.type = 'module';
    splineScript.src = 'https://unpkg.com/@splinetool/viewer@1.9.65/build/spline-viewer.js';
    document.head.appendChild(splineScript);

    return () => {
      document.head.removeChild(splineScript);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="text-2xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
        <div className="flex gap-4">
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Features</Button>
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="pt-32 text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Holobots Battle Arena
          </h1>
        </div>

        {/* Discover/Collect Section */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 md:gap-12 items-start mb-16 px-4 md:px-0">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              Discover, Collect &{" "}
              <span className="block mt-2">
                <WordCycler 
                  words={["Train", "Battle", "Quest", "Win!"]} 
                  interval={2000}
                />
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              Join the next generation of digital asset staking. Earn rewards while holding unique NFTs in the Holobots ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button className="bg-primary hover:bg-primary/90 px-4 md:px-8 py-4 md:py-6 text-base md:text-lg w-full">
                  Create Account to Mint Holobots
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div ref={splineContainerRef} className="relative h-[400px] w-full rounded-xl overflow-hidden glass-morphism">
            <spline-viewer 
              url="https://prod.spline.design/XqqxlVTJ7dVi8Azy/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Character Info Section */}
        <Characters />
      </main>
    </div>
  );
};

export default Landing;
