
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundEffect } from "@/components/BackgroundEffect";
import WordCycler from "@/components/WordCycler";

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex flex-col">
      <BackgroundEffect 
        particleCount={80}
        backgroundColor="transparent"
        particleColor="rgba(255,255,255,0.5)"
      />
      
      <header className="w-full p-4 flex justify-between items-center z-10">
        <div className="text-2xl font-bold text-white">
          Holobots
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            The Future of Digital <WordCycler words={['Combat', 'Collection', 'Training', 'Gaming']} />
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Train, battle and collect unique digital fighters powered by blockchain technology.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-holobots-accent hover:bg-holobots-hover">
                Get Started
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? "Hide Demo" : "View Demo"}
            </Button>
          </div>
        </div>
        
        {showDemo && (
          <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-black/40 border border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Feature {i}
                  </h3>
                  <p className="text-gray-300">
                    Description of amazing feature that makes Holobots unique and exciting.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <footer className="w-full py-4 px-6 text-center text-gray-400 z-10">
        <p>© {new Date().getFullYear()} Holobots. All rights reserved.</p>
      </footer>
    </div>
  );
}
