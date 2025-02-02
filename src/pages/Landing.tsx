import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import WordCycler from "@/components/WordCycler";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Landing = () => {
  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-holobots-background/80 dark:bg-holobots-dark-background/80 backdrop-blur-sm">
        <div className="text-2xl font-bold text-holobots-text dark:text-holobots-dark-text">Holobots</div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-holobots-text dark:text-holobots-dark-text">
            About
          </Button>
          <Button variant="ghost" className="text-holobots-text dark:text-holobots-dark-text">
            Features
          </Button>
          <Link to="/auth">
            <Button className="bg-holobots-accent hover:bg-holobots-hover text-white">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8">
            <h1 className="text-6xl font-bold leading-tight text-holobots-text dark:text-holobots-dark-text">
              Discover, Collect & {" "}
              <WordCycler 
                words={["Train", "Battle", "Quest", "🏆"]} 
                interval={2000}
              />
            </h1>
            <p className="text-lg text-holobots-text/80 dark:text-holobots-dark-text/80">
              Join the next generation of digital asset staking. Earn rewards while holding unique NFTs in the Holobots ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button className="bg-holobots-accent hover:bg-holobots-hover text-white px-8 py-6 text-lg w-full sm:w-auto">
                  Create Account to Mint Holobots
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex gap-12 pt-12">
              <div>
                <h3 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">24k+</h3>
                <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">Active Stakers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">40k+</h3>
                <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">NFTs Staked</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">1M+</h3>
                <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">HOLOS Earned</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Carousel className="w-full max-w-[300px] mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/d9918d37-05ab-49a8-b90d-66d6f89f5295.png"
                      alt="Shadow Holobot"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/433db76f-724b-484e-bd07-b01fde68f661.png"
                      alt="Huma Holobot"
                      className="w-full h-auto rounded-lg object-contain"
                    />
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <img
                      src="/lovable-uploads/ae1e648c-596d-49d0-b944-27cdf423a7e1.png"
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
      </main>
    </div>
  );
};

export default Landing;