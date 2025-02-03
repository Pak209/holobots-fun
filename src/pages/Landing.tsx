import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import WordCycler from "@/components/WordCycler";
import { Characters } from "@/components/Characters";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Landing = () => {
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
          <p className="text-muted-foreground text-lg">
            Choose your mechanical warrior and master their unique abilities
          </p>
        </div>

        {/* Discover/Collect Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh] mb-16">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold leading-tight">
              Discover, Collect & {" "}
              <WordCycler 
                words={["Train", "Battle", "Quest", "Win!"]} 
                interval={2000}
              />
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the next generation of digital asset staking. Earn rewards while holding unique NFTs in the Holobots ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg w-full sm:w-auto">
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
            <div className="flex gap-12 pt-12">
              <div>
                <h3 className="text-3xl font-bold">24k+</h3>
                <p className="text-muted-foreground">Active Stakers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold">40k+</h3>
                <p className="text-muted-foreground">NFTs Staked</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold">1M+</h3>
                <p className="text-muted-foreground">HOLOS Earned</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Carousel className="w-full max-w-[300px] mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/60586301-1d5a-471c-92b8-72e2d0f7c311.png"
                      alt="Shadow Holobot"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png"
                      alt="Kuma Holobot"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/a8cd74c8-4e2e-4f29-8b1c-913657f0ae03.png"
                      alt="Ace Holobot"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </div>

        {/* Character Info Section */}
        <Characters />
      </main>
    </div>
  );
};

export default Landing;
