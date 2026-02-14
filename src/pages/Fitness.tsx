import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

export default function Fitness() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [needleRotation, setNeedleRotation] = useState(-90);

  useEffect(() => {
    if (user?.holobots && user.holobots.length > 0 && !selectedHolobot) {
      setSelectedHolobot(user.holobots[0].name);
    }
  }, [user, selectedHolobot]);

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        const speed = Math.random() * 10 + 5;
        const rotation = -90 + (speed / 20) * 180;
        setNeedleRotation(rotation);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setNeedleRotation(-90);
    }
  }, [isTracking]);

  const startWorkout = () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to work out with",
        variant: "destructive",
      });
      return;
    }
    setIsTracking(true);
  };

  const stopWorkout = () => {
    setIsTracking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5C400] via-[#E5B800] to-[#D4A400] relative overflow-hidden pb-24">
      {/* Diagonal stripes background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-32 bg-gradient-to-r from-transparent via-[#D4A400] to-transparent transform -skew-x-12"
            style={{ left: `${i * 8}%` }}
          />
        ))}
      </div>

      {/* Container scaled to mobile proportions (Figma: 1800x3200) */}
      <div className="relative z-10 w-full max-w-[390px] mx-auto">
        
        {/* 1. SYNC POINT ELEMENT - Top header */}
        <div className="relative w-full" style={{ height: '60px' }}>
          <img 
            src="/icons/SyncPointElement.svg" 
            alt="Sync Point"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. GOAL ELEMENT - Figma: 914x267 within 1800 width = ~50% width, aspect ratio 914:267 = 3.42:1 */}
        <div className="relative w-1/2 mx-auto" style={{ aspectRatio: '914 / 267' }}>
          <img 
            src="/icons/GoalElement.svg" 
            alt="Goal"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 3. MECH DETAIL ELEMENT */}
        <div className="relative w-full px-4 mt-2">
          <div className="relative w-full" style={{ height: '100px' }}>
            <img 
              src="/icons/MechDetailElement.svg" 
              alt="Mecha Details"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 4. SPEEDOMETER WITH NEEDLE INSIDE - Figma shows needle at (811, 1621) with size 366x211 */}
        <div className="relative w-full px-8 mt-4" style={{ height: '280px' }}>
          {/* Speedometer base - full width */}
          <img 
            src="/icons/Speedometer.svg" 
            alt="Speedometer"
            className="absolute inset-0 w-full h-full object-contain"
          />
          
          {/* Needle INSIDE - Figma ratio: 366:211 ≈ 1.73:1, positioned at center-bottom of speedometer */}
          <div 
            className="absolute left-1/2 -translate-x-1/2"
            style={{ 
              bottom: '25%',
              width: '140px',
              aspectRatio: '366 / 211'
            }}
          >
            <img 
              src="/icons/needle.svg" 
              alt="Needle"
              className="w-full h-full transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transformOrigin: 'center bottom'
              }}
            />
          </div>
        </div>

        {/* 5. DISTANCE ELEMENT */}
        <div className="relative w-full px-4 mt-4" style={{ height: '110px' }}>
          <img 
            src="/icons/DistanceElement.svg" 
            alt="Distance"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 6. BOTTOM ELEMENT + GO BUTTON INSIDE - Figma: BottomElement 1800x992 */}
        <div className="relative w-full px-4 mt-4" style={{ height: '210px' }}>
          {/* BottomElement - aspect ratio 1800:992 ≈ 1.81:1 */}
          <img 
            src="/icons/BottomElement.svg" 
            alt="Bottom Element"
            className="absolute top-0 left-4 right-4 h-28 object-contain"
          />
          
          {/* GoButton INSIDE - positioned at bottom, overlaying BottomElement */}
          <button
            onClick={isTracking ? stopWorkout : startWorkout}
            className="absolute bottom-0 left-4 right-4 h-24 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <img 
              src="/icons/GoButton.svg" 
              alt="GO"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
