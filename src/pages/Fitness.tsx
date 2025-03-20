
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Motion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { StatusBar } from "@/components/HealthBar";
import { FitnessStat } from "@/components/fitness/FitnessStat";
import { WorkoutRewards } from "@/components/fitness/WorkoutRewards";
import { HolobotSelector } from "@/components/fitness/HolobotSelector";

export default function Fitness() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [rewards, setRewards] = useState({
    exp: 0,
    holos: 0,
    attributeBoosts: 0,
  });

  // Set initial selected holobot from user's holobots
  useEffect(() => {
    if (user?.holobots && user.holobots.length > 0 && !selectedHolobot) {
      setSelectedHolobot(user.holobots[0].name);
    }
  }, [user, selectedHolobot]);

  // Simulated workout tracking (in real app would use device sensors)
  useEffect(() => {
    let timer: number | null = null;
    
    if (isTracking) {
      timer = window.setInterval(() => {
        // Increment workout time (in seconds)
        setWorkoutTime(prev => prev + 1);
        
        // Simulate distance calculation (would use GPS in real app)
        setDistance(prev => {
          const newDistance = prev + 0.01; // Add 10 meters
          return parseFloat(newDistance.toFixed(2));
        });
        
        // Decrease stamina over time (would integrate with heart rate in real app)
        setStamina(prev => {
          const newStamina = Math.max(0, prev - 0.2);
          if (newStamina <= 0) {
            // Auto-stop when stamina is depleted
            setIsTracking(false);
            completeWorkout();
          }
          return newStamina;
        });
        
        // Calculate rewards based on time and distance
        setRewards(prev => ({
          exp: Math.min(100, prev.exp + 0.2),
          holos: Math.floor(workoutTime / 10),
          attributeBoosts: Math.floor(distance / 0.5),
        }));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking, workoutTime, distance]);

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
    toast({
      title: "Workout Started",
      description: "Your workout session has begun!",
    });
  };

  const stopWorkout = () => {
    setIsTracking(false);
    completeWorkout();
  };

  const completeWorkout = () => {
    if (distance > 0 && user) {
      // Calculate rewards
      const earnedHolos = Math.floor(distance * 10);
      const earnedExp = Math.floor(distance * 20);
      
      // Give rewards to user
      updateUser({
        holosTokens: user.holosTokens + earnedHolos,
        // Update experience for the selected holobot
        holobots: user.holobots.map(bot => 
          bot.name === selectedHolobot 
            ? { ...bot, experience: bot.experience + earnedExp } 
            : bot
        )
      });
      
      // Reset tracking stats
      setWorkoutTime(0);
      setDistance(0);
      setStamina(100);
      
      toast({
        title: "Workout Complete!",
        description: `You earned ${earnedHolos} Holos and ${earnedExp} EXP!`,
      });
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background p-4">
      <div className="max-w-md mx-auto pt-16">
        <h1 className="text-2xl font-bold text-center mb-6 text-holobots-accent">
          FITNESS SYNC
        </h1>
        
        {/* Holobot selector */}
        <HolobotSelector 
          holobots={user?.holobots || []}
          selectedHolobot={selectedHolobot}
          onSelect={setSelectedHolobot}
        />

        {/* Main workout interface */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)] p-4 mb-6">
          {/* Selected Holobot Display */}
          <div className="relative flex justify-center mb-6">
            {selectedHolobot && (
              <>
                {/* Circular platform effect */}
                <div className="absolute bottom-0 w-40 h-10 bg-cyan-500/20 rounded-full blur-md"></div>
                
                {/* Holobot image */}
                <img 
                  src={getHolobotImagePath(selectedHolobot)} 
                  alt={selectedHolobot}
                  className="h-60 object-contain z-10"
                />
                
                {/* Energy ring around holobot */}
                <div className={cn(
                  "absolute bottom-0 w-40 h-40 rounded-full border-2 border-cyan-400/50",
                  "flex items-center justify-center",
                  isTracking ? "animate-pulse" : ""
                )}>
                  <div className="w-36 h-36 rounded-full border border-cyan-300/30"></div>
                </div>
              </>
            )}
          </div>
          
          {/* Workout stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <FitnessStat 
              icon="distance" 
              label="DISTANCE"
              value={`${distance.toFixed(2)}KM`} 
              subValue={`TARGET: 5.0KM`}
              progress={distance / 5 * 100}
            />
            
            <FitnessStat 
              icon="time" 
              label="TIME"
              value={formatTime(workoutTime)} 
              subValue="TARGET: 30:00"
              progress={workoutTime / 1800 * 100}
            />
          </div>
          
          {/* Stamina bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-cyan-400">STAMINA</span>
              <span className="text-xs text-cyan-400">{stamina.toFixed(0)}%</span>
            </div>
            <StatusBar 
              current={stamina} 
              max={100} 
              type="health" 
              isLeft={true}
            />
          </div>
          
          {/* Workout rewards */}
          <WorkoutRewards rewards={rewards} />
          
          {/* Action button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={isTracking ? stopWorkout : startWorkout}
              className={cn(
                "w-40 h-14 rounded-full font-bold text-lg",
                isTracking 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-cyan-500 hover:bg-cyan-600"
              )}
            >
              {isTracking ? "STOP" : "START"}
            </Button>
          </div>
        </div>
        
        {/* Attributes section */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(128,0,255,0.15)] p-4 mb-6">
          <h2 className="text-lg font-bold mb-4 text-purple-400">ATTRIBUTES</h2>
          
          {selectedHolobot && user?.holobots ? (
            <div className="space-y-4">
              {/* Find the selected holobot's data */}
              {user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">ATTACK</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.attack || 0}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.attack || 0]} 
                      max={100}
                      disabled
                      className="h-1.5"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">DEFENSE</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.defense || 0}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.defense || 0]} 
                      max={100}
                      disabled
                      className="h-1.5"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">SPEED</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.speed || 0}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.speed || 0]} 
                      max={100}
                      disabled
                      className="h-1.5"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">HEALTH</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.health || 0}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.health || 0]} 
                      max={100}
                      disabled
                      className="h-1.5"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No Holobot selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
