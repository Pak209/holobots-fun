import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DevAccessWrapper } from "@/components/DevAccessWrapper";

const STEPS_PER_KM = 1250; // Approximately 1250 steps per kilometer
const TARGET_DAILY_STEPS = 10000; // Target steps per day (8 km)
const SYNC_POINTS_PER_KM = 135; // Sync points earned per kilometer
const EXP_PER_KM = 250; // EXP earned per kilometer
const SP_PER_KM = 10; // SP (Skill Points) per kilometer

export default function Fitness() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState(0);
  const [workoutSteps, setWorkoutSteps] = useState(0);
  const [needleRotation, setNeedleRotation] = useState(-90); // Start at 0 km/h

  // Set initial selected holobot from user's holobots
  useEffect(() => {
    if (user?.holobots && user.holobots.length > 0 && !selectedHolobot) {
      setSelectedHolobot(user.holobots[0].name);
    }
  }, [user, selectedHolobot]);

  // Get the current holobot
  const currentHolobot = user?.holobots?.find(
    h => h.name.toLowerCase() === selectedHolobot?.toLowerCase()
  );

  // Calculate current progress
  const kilometersCompleted = (steps / STEPS_PER_KM).toFixed(3);
  const currentSpeed = isTracking ? Math.random() * 10 + 5 : 0; // Random speed between 5-15 km/h when tracking
  const progressPercentage = Math.min((steps / TARGET_DAILY_STEPS) * 100, 100);
  const syncPointsEarned = Math.floor((steps / STEPS_PER_KM) * SYNC_POINTS_PER_KM);
  const expEarned = Math.floor((steps / STEPS_PER_KM) * EXP_PER_KM);
  const spEarned = Math.floor((steps / STEPS_PER_KM) * SP_PER_KM);

  // Update needle rotation based on speed (0-20 km/h maps to -90deg to +90deg)
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        const speed = Math.random() * 10 + 5; // 5-15 km/h
        const rotation = -90 + (speed / 20) * 180; // Map 0-20 km/h to -90 to +90 degrees
        setNeedleRotation(rotation);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setNeedleRotation(-90); // Reset to 0
    }
  }, [isTracking]);

  // Simulated step tracking
  useEffect(() => {
    let timer: number | null = null;
    
    if (isTracking) {
      timer = window.setInterval(() => {
        const stepsIncrement = Math.floor(Math.random() * 5) + 3; // 3-7 steps per second
        setSteps(prev => prev + stepsIncrement);
        setWorkoutSteps(prev => prev + stepsIncrement);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
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
    setWorkoutSteps(0);
    toast({
      title: "Workout Started",
      description: "Start moving to earn rewards!",
    });
  };

  const stopWorkout = () => {
    setIsTracking(false);
    
    if (workoutSteps > 0 && user && selectedHolobot) {
      // Update user with rewards
      const finalSyncPoints = Math.floor((workoutSteps / STEPS_PER_KM) * SYNC_POINTS_PER_KM);
      const finalExp = Math.floor((workoutSteps / STEPS_PER_KM) * EXP_PER_KM);
      
      updateUser({
        holosTokens: user.holosTokens + finalSyncPoints,
        holobots: user.holobots.map(bot => 
          bot.name.toLowerCase() === selectedHolobot.toLowerCase()
            ? { 
                ...bot, 
                experience: bot.experience + finalExp,
              } 
            : bot
        )
      });
      
      setWorkoutSteps(0);
      
      toast({
        title: "Workout Complete!",
        description: `You earned ${finalSyncPoints} Sync Points and ${finalExp} EXP!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5C400] via-[#E5B800] to-[#D4A400] relative overflow-hidden">
      <DevAccessWrapper
        fallback={
          <div className="text-center py-12 px-4">
            <h2 className="text-2xl font-bold text-black mb-4">🚧 SYNC TRAINING - COMING SOON</h2>
            <p className="text-black/80 mb-6">
              We're working hard to bring you the ultimate fitness experience.
            </p>
          </div>
        }
      >
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

        <div className="relative z-10 max-w-md mx-auto px-4 pb-24">
          {/* 1. SYNC POINT ELEMENT - Top Header */}
          <div className="relative mt-4 mb-4">
            <img 
              src="/icons/SyncPointElement.svg" 
              alt="Sync Point Header"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex flex-col items-start justify-center pl-6">
              <h2 className="text-white text-xl font-black uppercase tracking-wider">SYNC POINT</h2>
              <p className="text-red-500 text-3xl font-black">+{syncPointsEarned}</p>
            </div>
          </div>

          {/* 2. GOAL ELEMENT */}
          <div className="relative mb-4">
            <img 
              src="/icons/GoalElement.svg" 
              alt="Goal Progress"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-black uppercase">GOAL</span>
                <span className="text-white text-2xl font-black">{steps}/{TARGET_DAILY_STEPS}</span>
              </div>
            </div>
          </div>

          {/* 3. MECH DETAIL ELEMENT - Left side */}
          <div className="relative mb-4 flex items-start gap-4">
            <div className="relative w-1/2">
              <img 
                src="/icons/MechDetailElement.svg" 
                alt="Mecha Details"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 flex flex-col justify-center pl-4">
                <p className="text-white text-xs font-bold">{currentHolobot?.name || "MEcha No001"}</p>
                <div className="bg-[#F5C400] h-1 w-3/4 mt-1 mb-1"></div>
                <p className="text-white text-sm font-black">Lv {currentHolobot?.level || 14}</p>
              </div>
            </div>

            {/* CHANGE MECHA Button - Right side */}
            <div className="w-1/2 flex items-center justify-end">
              <button
                onClick={() => {
                  // Cycle through holobots
                  const holobots = user?.holobots || [];
                  if (holobots.length > 0) {
                    const currentIndex = holobots.findIndex(h => h.name === selectedHolobot);
                    const nextIndex = (currentIndex + 1) % holobots.length;
                    setSelectedHolobot(holobots[nextIndex].name);
                  }
                }}
                className="bg-black text-[#F5C400] font-black uppercase text-sm px-6 py-3 border-4 border-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all flex items-center gap-2"
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M21 12a9 9 0 11-9-9 9 9 0 019 9z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                CHANGE MECHA
              </button>
            </div>
          </div>

          {/* 4 & 5. SPEEDOMETER + NEEDLE */}
          <div className="relative w-full flex justify-center mb-6">
            <div className="relative w-80 h-40">
              {/* Speedometer base */}
              <img 
                src="/icons/Speedometer.svg" 
                alt="Speedometer"
                className="absolute inset-0 w-full h-full object-contain"
              />
              
              {/* Needle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/icons/needle.svg" 
                  alt="Speed Needle"
                  className="absolute w-32 h-32 transition-transform duration-500 ease-out"
                  style={{
                    transform: `rotate(${needleRotation}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                />
              </div>
              
              {/* Speed text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <p className="text-white text-4xl font-black">{currentSpeed.toFixed(0)} km/h</p>
                <p className="text-white text-xs uppercase tracking-wider">Movement speed</p>
              </div>
            </div>
          </div>

          {/* 6. DISTANCE ELEMENT */}
          <div className="relative mb-4">
            <img 
              src="/icons/DistanceElement.svg" 
              alt="Distance Traveled"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-4">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 5.5c1.09 0 2-.89 2-2 0-1.1-.91-2-2-2s-2 .9-2 2c0 1.11.91 2 2 2zm-1.5 7.5v6h3v-6h3l-4.5-7-4.5 7h3z"/>
              </svg>
              <div>
                <p className="text-white text-5xl font-black">{kilometersCompleted}</p>
                <p className="text-white text-sm uppercase tracking-wider">Kilometers</p>
              </div>
            </div>
          </div>

          {/* 7. BOTTOM ELEMENT - Rewards */}
          <div className="relative mb-4">
            <img 
              src="/icons/BottomElement.svg" 
              alt="Rewards"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {/* Sync Points */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F5C400] border-2 border-black flex items-center justify-center" style={{
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                }}>
                  <span className="text-black text-xs font-black">SP</span>
                </div>
                <span className="text-[#F5C400] text-2xl font-black">+{syncPointsEarned}</span>
              </div>

              {/* SP (Skill Points) */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-400 border-2 border-black rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-black">S</span>
                </div>
                <span className="text-cyan-400 text-2xl font-black">+{spEarned}</span>
              </div>

              {/* EXP */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F5C400] border-2 border-black rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-black">EXP</span>
                </div>
                <span className="text-[#F5C400] text-2xl font-black">+{expEarned}</span>
              </div>
            </div>
          </div>

          {/* 8. GO BUTTON */}
          <div className="relative">
            <img 
              src="/icons/GoButton.svg" 
              alt="Go Button"
              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={isTracking ? stopWorkout : startWorkout}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={cn(
                "text-6xl font-black uppercase tracking-widest",
                isTracking ? "text-red-500" : "text-[#F5C400]"
              )}>
                {isTracking ? "STOP" : "GO"}
              </span>
            </div>
          </div>
        </div>
      </DevAccessWrapper>
    </div>
  );
}
