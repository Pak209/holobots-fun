import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import WordCycler from "@/components/WordCycler";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useState } from "react";
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
    navigate('/auth');
  };

  const featuredHolobots = ["ace", "kuma", "shadow", "era"];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundEffect />
      
      {/* Sci-Fi HUD Header */}
      <header className="fixed top-0 w-full p-3 sm:p-4 flex justify-between items-center z-50 bg-black/90 backdrop-blur-sm border-b-2 border-[#F5C400]">
        <div className="text-lg sm:text-xl font-black italic tracking-widest uppercase text-[#F5C400]">
          HOLOBOTS
        </div>
        <div className="flex gap-2">
          <Link to="/bytepaper">
            <Button 
              size="sm" 
              className="bg-black border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black font-bold uppercase tracking-wider text-xs transition-colors"
              style={{
                clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Bytepaper</span>
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[0_0_10px_rgba(245,196,0,0.5)] transition-colors"
            onClick={handleLaunchApp}
            style={{
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}
          >
            Launch App
          </Button>
        </div>
      </header>

      <main className="pt-20 pb-10 px-4">
        {/* Hero Section */}
        <div className="text-center mb-10 bg-black border-4 border-[#F5C400] p-6 shadow-[0_0_30px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-[#F5C400] uppercase tracking-widest">
            Holobots Battle Arena
          </h1>
          <p className="text-gray-300 mb-6 uppercase tracking-wide text-sm">
            Train, battle and collect unique digital fighters
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="w-full sm:w-auto bg-[#F5C400] hover:bg-[#D4A400] py-5 sm:py-6 text-base sm:text-lg text-black font-black uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(245,196,0,0.5)] transition-colors"
              onClick={handleLaunchApp}
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}
            >
              Start Your Journey
              <ArrowRight className="ml-2" />
            </Button>
            <Link to="/bytepaper" className="w-full sm:w-auto">
              <Button 
                className="w-full py-5 sm:py-6 text-base sm:text-lg bg-black border-3 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black font-black uppercase tracking-widest transition-colors"
                style={{
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                }}
              >
                Read Bytepaper
                <FileText className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Discover Section */}
        <div className="mb-12 bg-black border-4 border-[#F5C400] p-6 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}>
          <h2 className="text-xl sm:text-2xl font-black leading-tight mb-3 text-white uppercase tracking-widest">
            Discover, Collect &{" "}
            <span className="text-[#F5C400]">
              <WordCycler 
                words={["Train", "Battle", "Quest", "Win!"]} 
                interval={2000}
              />
            </span>
          </h2>
          <p className="text-sm text-gray-300 mb-6 uppercase tracking-wide">
            Join the next generation of digital asset staking. Earn rewards while holding unique NFTs in the Holobots ecosystem.
          </p>
        </div>

        {/* Featured Holobots */}
        <div className="mb-10 bg-black border-4 border-[#F5C400] p-6 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}>
          <h2 className="text-lg sm:text-xl font-black mb-4 text-[#F5C400] uppercase tracking-widest">Featured Holobots</h2>
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
        <div className="bg-black border-4 border-[#F5C400] p-6 flex flex-col items-center text-center shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}>
          <h3 className="text-lg sm:text-xl font-black mb-2 text-[#F5C400] uppercase tracking-widest">Ready to join the battle?</h3>
          <p className="text-sm text-gray-300 mb-4 uppercase tracking-wide">
            Create your account now and start collecting Holobots
          </p>
          <Button 
            className="w-full sm:w-auto bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest border-3 border-black shadow-[0_0_10px_rgba(245,196,0,0.5)] py-3 transition-colors"
            onClick={handleLaunchApp}
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}
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
