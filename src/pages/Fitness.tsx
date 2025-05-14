import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { StatusBar } from "@/components/HealthBar";
import { FitnessStat } from "@/components/fitness/FitnessStat";
import { WorkoutRewards } from "@/components/fitness/WorkoutRewards";
import { HolobotSelector } from "@/components/fitness/HolobotSelector";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HolobotRank {
  name: string;
  multiplier: number;
}

const HOLOBOT_RANKS: Record<string, HolobotRank> = {
  "Champion": { name: "Champion", multiplier: 0.25 },
  "Rare": { name: "Rare", multiplier: 0.5 },
  "Elite": { name: "Elite", multiplier: 1 },
  "Legendary": { name: "Legendary", multiplier: 2 }
};

const STEPS_PER_EXP = 10; // 10 steps = 1 EXP point (1000 steps = 100 EXP)
const STEPS_PER_MILE = 2000; // Approximately 2000 steps per mile
const HOLOS_PER_MILE = 250; // Base holos per mile
const TARGET_DAILY_STEPS = 10000; // Target steps per day
const TARGET_WORKOUT_TIME = 30 * 60; // 30 minutes workout in seconds

export default function Fitness() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [workoutSteps, setWorkoutSteps] = useState(0);
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

  // Get the current holobot
  const currentHolobot = user?.holobots?.find(
    h => h.name.toLowerCase() === selectedHolobot?.toLowerCase()
  );

  // Determine the holobot's rank multiplier
  const getHolobotRankMultiplier = (): number => {
    if (!currentHolobot) return 1;
    
    const rank = currentHolobot.rank || "Champion";
    return HOLOBOT_RANKS[rank]?.multiplier || 1;
  };

  // Reset steps at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        setSteps(0);
        toast({
          title: "Daily Steps Reset",
          description: "Your step counter has been reset for the new day.",
        });
      }
    };

    const interval = setInterval(checkMidnight, 1000);
    return () => clearInterval(interval);
  }, [toast]);

  // Simulated workout tracking (in real app would use device sensors)
  useEffect(() => {
    let timer: number | null = null;
    
    if (isTracking) {
      timer = window.setInterval(() => {
        // Increment workout time (in seconds)
        setWorkoutTime(prev => prev + 1);
        
        // Simulate step counting (would use Health Kit in real app)
        const stepsIncrement = Math.floor(Math.random() * 5) + 1; // 1-5 steps per second
        
        setSteps(prev => prev + stepsIncrement);
        setWorkoutSteps(prev => prev + stepsIncrement);
        
        // Decrease stamina over time
        setStamina(prev => {
          const newStamina = Math.max(0, prev - 0.2);
          if (newStamina <= 0) {
            // Auto-stop when stamina is depleted
            setIsTracking(false);
            completeWorkout();
          }
          return newStamina;
        });
        
        // Calculate rewards based on steps and time
        const expEarned = Math.floor(workoutSteps / STEPS_PER_EXP);
        const milesCompleted = workoutSteps / STEPS_PER_MILE;
        const rankMultiplier = getHolobotRankMultiplier();
        const holosEarned = Math.floor(milesCompleted * HOLOS_PER_MILE * rankMultiplier);
        
        setRewards({
          exp: expEarned,
          holos: holosEarned,
          attributeBoosts: Math.floor(expEarned / 100), // One boost point per 100 EXP
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking, workoutTime, workoutSteps]);

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
    setWorkoutSteps(0); // Reset workout steps counter
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
    if (workoutSteps > 0 && user && selectedHolobot) {
      // Calculate final rewards
      const expEarned = Math.floor(workoutSteps / STEPS_PER_EXP);
      const milesCompleted = workoutSteps / STEPS_PER_MILE;
      const rankMultiplier = getHolobotRankMultiplier();
      const holosEarned = Math.floor(milesCompleted * HOLOS_PER_MILE * rankMultiplier);
      
      // Find the selected holobot
      const selectedHolobotObj = user.holobots.find(
        h => h.name.toLowerCase() === selectedHolobot.toLowerCase()
      );
      
      if (selectedHolobotObj) {
        // Update user with rewards
        updateUser({
          holosTokens: user.holosTokens + holosEarned,
          // Update experience for the selected holobot
          holobots: user.holobots.map(bot => 
            bot.name.toLowerCase() === selectedHolobot.toLowerCase()
              ? { 
                  ...bot, 
                  experience: bot.experience + expEarned,
                  // Add attribute point for the workout (1 per workout completion)
                  attributePoints: (bot.attributePoints || 0) + 1
                } 
              : bot
          )
        });
        
        // Reset tracking stats
        setWorkoutTime(0);
        setWorkoutSteps(0);
        setStamina(100);
        
        toast({
          title: "Workout Complete!",
          description: `You earned ${holosEarned} Holos and ${expEarned} EXP!`,
        });
      }
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white p-4">
      <div className="max-w-md mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400 font-orbitron italic">
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
              icon="steps" 
              label="STEPS"
              value={`${steps.toLocaleString()}`} 
              subValue={`TARGET: ${TARGET_DAILY_STEPS.toLocaleString()}`}
              progress={steps / TARGET_DAILY_STEPS * 100}
            />
            
            <FitnessStat 
              icon="time" 
              label="WORKOUT"
              value={formatTime(workoutTime)} 
              subValue="TARGET: 30:00"
              progress={workoutTime / TARGET_WORKOUT_TIME * 100}
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
          
          {/* Holobot rank multiplier indicator */}
          {currentHolobot && (
            <div className="mt-4 bg-black/40 rounded-lg p-3 border border-purple-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-400">RANK BONUS</span>
                <span className="text-sm font-bold text-purple-400">
                  {currentHolobot.rank || "Champion"} (×{getHolobotRankMultiplier()})
                </span>
              </div>
            </div>
          )}
          
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
                    <Progress 
                      value={user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.attack || 0} 
                      max={100}
                      className="h-1.5 bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">DEFENSE</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.defense || 0}
                      </span>
                    </div>
                    <Progress 
                      value={user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.defense || 0} 
                      max={100}
                      className="h-1.5 bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">SPEED</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.speed || 0}
                      </span>
                    </div>
                    <Progress 
                      value={user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.speed || 0} 
                      max={100}
                      className="h-1.5 bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">HEALTH</span>
                      <span className="text-xs">
                        +{user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.health || 0}
                      </span>
                    </div>
                    <Progress 
                      value={user.holobots.find(bot => bot.name === selectedHolobot)?.boostedAttributes?.health || 0} 
                      max={100}
                      className="h-1.5 bg-gray-800"
                    />
                  </div>
                  
                  {/* Show available attribute points */}
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-purple-400">AVAILABLE POINTS</span>
                      <span className="text-sm font-bold text-yellow-400">
                        {user.holobots.find(bot => bot.name === selectedHolobot)?.attributePoints || 0}
                      </span>
                    </div>
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
