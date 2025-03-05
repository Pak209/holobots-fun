import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WordCycler from "@/components/WordCycler";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import BackgroundEffect from "@/components/BackgroundEffect";

const Landing = () => {
  const [api, setApi] = useState<any>();
  const navigate = useNavigate();

  const autoplayOptions = {
    delay: 3000,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };

  const handleLaunchApp = () => {
    navigate('/dashboard');
  };

  const featuredHolobots = ["ace", "kuma", "shadow", "era"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 relative overflow-hidden">
      <BackgroundEffect />
      
      {/* Mobile header */}
      <header className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="text-xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
        <div className="flex gap-2">
          <Link to="/bytepaper">
            <Button 
              variant="ghost" 
              size="sm" 
              className="border border-primary/30 text-primary"
            >
              <FileText className="h-4 w-4 mr-1" />
              Bytepaper
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-primary/20 border-primary/50 text-primary"
            onClick={handleLaunchApp}
          >
            Launch App
          </Button>
        </div>
      </header>

      <main className="pt-20 pb-10 px-4">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Holobots Battle Arena
          </h1>
          <p className="text-muted-foreground mb-6">
            Train, battle and collect unique digital fighters
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 py-6 text-lg"
              onClick={handleLaunchApp}
            >
              Start Your Journey
              <ArrowRight className="ml-2" />
            </Button>
            <Link to="/bytepaper" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full py-6 text-lg border-primary/50 text-primary"
              >
                Read Bytepaper
                <FileText className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Discover Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold leading-tight mb-3">
            Discover, Collect &{" "}
            <span className="text-holobots-accent">
              <WordCycler 
                words={["Train", "Battle", "Quest", "Win!"]} 
                interval={2000}
              />
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Join the next generation of digital asset staking. Earn rewards while holding unique NFTs in the Holobots ecosystem.
          </p>
        </div>

        {/* Featured Holobots */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Featured Holobots</h2>
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay(autoplayOptions)
            ]}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent>
              {featuredHolobots.map((holobot) => (
                <CarouselItem key={holobot} className="basis-1/2 md:basis-1/3">
                  <div className="p-1">
                    <HolobotCard stats={HOLOBOT_STATS[holobot as keyof typeof HOLOBOT_STATS]} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* CTA */}
        <div className="bg-holobots-card rounded-lg p-4 flex flex-col items-center text-center">
          <h3 className="text-lg font-bold mb-2">Ready to join the battle?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your account now and start collecting Holobots
          </p>
          <Button 
            className="w-full"
            onClick={handleLaunchApp}
          >
            Get Started
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Landing;
