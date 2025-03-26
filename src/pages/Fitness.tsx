import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Fixed import
import { FitnessStat } from "@/components/fitness/FitnessStat";
import { HolobotSelector } from "@/components/fitness/HolobotSelector";
import { WorkoutRewards } from "@/components/fitness/WorkoutRewards";
import { Dumbbell, Medal, Timer, Zap, HeartPulse, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Fitness() {
  const { user, updateUser } = useAuth();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    calories: 0,
    steps: 0,
    heartRate: 0,
    intensity: 0,
  });
  const [rewards, setRewards] = useState({
    exp: 0,
    tokens: 0,
  });

  // Timer for workout
  useEffect(() => {
    let interval: number | null = null;
    
    if (isWorking) {
      interval = window.setInterval(() => {
        setWorkoutTime(prev => {
          // Generate random workout stats
          setWorkoutStats({
            calories: Math.floor(prev * 0.8),
            steps: Math.floor(prev * 12),
            heartRate: Math.floor(120 + Math.random() * 40),
            intensity: Math.floor(60 + Math.random() * 40),
          });
          
          return prev + 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking]);

  const startWorkout = () => {
    if (!selectedHolobot) {
      toast({
        title: "Select a Holobot",
        description: "Please select a Holobot to start your workout",
        variant: "destructive",
      });
      return;
    }
    
    setIsWorking(true);
    setWorkoutTime(0);
    setWorkoutCompleted(false);
    
    toast({
      title: "Workout Started",
      description: "Your fitness session has begun!",
    });
  };

  const stopWorkout = async () => {
    if (workoutTime < 10) {
      toast({
        title: "Workout too short",
        description: "Workouts must be at least 10 seconds to earn rewards",
        variant: "destructive",
      });
      setIsWorking(false);
      return;
    }
    
    setIsWorking(false);
    setWorkoutCompleted(true);
    
    // Calculate rewards based on workout time
    const expGained = Math.floor(workoutTime * 0.5);
    const tokensGained = Math.floor(workoutTime * 0.2);
    
    setRewards({
      exp: expGained,
      tokens: tokensGained,
    });
    
    // Update user's holobot with gained experience
    if (user && selectedHolobot) {
      const updatedHolobots = [...user.holobots];
      const holobotIndex = updatedHolobots.findIndex(h => h.name === selectedHolobot);
      
      if (holobotIndex !== -1) {
        const holobot = updatedHolobots[holobotIndex];
        const newExp = holobot.experience + expGained;
        let newLevel = holobot.level;
        
        // Check if holobot leveled up
        if (newExp >= holobot.nextLevelExp) {
          newLevel += 1;
          
          toast({
            title: "Level Up!",
            description: `${holobot.name} reached level ${newLevel}!`,
          });
        }
        
        updatedHolobots[holobotIndex] = {
          ...holobot,
          experience: newExp,
          level: newLevel,
          nextLevelExp: newLevel * 100, // Simple formula for next level
        };
        
        // Update user profile
        await updateUser({
          holobots: updatedHolobots,
          holosTokens: (user.holosTokens || 0) + tokensGained,
        });
      }
    }
    
    toast({
      title: "Workout Complete",
      description: `You earned ${expGained} XP and ${tokensGained} Holos Tokens!`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-holobots-accent">Fitness Training</h1>
        <p className="text-gray-400">Train your Holobots with real-world exercise</p>
      </div>
      
      {!isWorking && !workoutCompleted && (
        <HolobotSelector 
          holobots={user?.holobots || []}
          selectedHolobot={selectedHolobot}
          onSelect={setSelectedHolobot}
        />
      )}
      
      {isWorking && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Workout in Progress</span>
                <Timer className="h-5 w-5 text-holobots-accent" />
              </CardTitle>
              <CardDescription>
                Training {selectedHolobot}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-mono font-bold text-holobots-accent">
                  {formatTime(workoutTime)}
                </span>
              </div>
              
              <div className="space-y-4 mt-6">
                <FitnessStat 
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                  label="Calories Burned"
                  value={workoutStats.calories}
                  suffix="cal"
                  color="orange"
                />
                
                <FitnessStat 
                  icon={<Dumbbell className="h-5 w-5 text-blue-500" />}
                  label="Steps"
                  value={workoutStats.steps}
                  color="blue"
                />
                
                <FitnessStat 
                  icon={<HeartPulse className="h-5 w-5 text-red-500" />}
                  label="Heart Rate"
                  value={workoutStats.heartRate}
                  suffix="bpm"
                  color="red"
                />
                
                <FitnessStat 
                  icon={<Zap className="h-5 w-5 text-yellow-500" />}
                  label="Intensity"
                  value={workoutStats.intensity}
                  suffix="%"
                  color="yellow"
                >
                  <Progress value={workoutStats.intensity} className="h-2 mt-2" />
                </FitnessStat>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            onClick={stopWorkout}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            End Workout
          </Button>
        </div>
      )}
      
      {workoutCompleted && (
        <WorkoutRewards
          holobotName={selectedHolobot || ""}
          duration={workoutTime}
          calories={workoutStats.calories}
          exp={rewards.exp}
          tokens={rewards.tokens}
          onClose={() => {
            setWorkoutCompleted(false);
            setSelectedHolobot(null);
          }}
        />
      )}
      
      {!isWorking && !workoutCompleted && selectedHolobot && (
        <Button 
          onClick={startWorkout}
          className="w-full bg-holobots-accent hover:bg-holobots-accent/80"
          size="lg"
        >
          Start Workout
        </Button>
      )}
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Medal className="h-5 w-5 mr-2 text-holobots-accent" />
            Fitness Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Earn XP for your Holobots based on workout duration</p>
          <p>• Gain Holos Tokens as rewards for staying active</p>
          <p>• Improve your Holobot's stats through consistent training</p>
          <p>• Unlock special fitness achievements and rewards</p>
        </CardContent>
      </Card>
    </div>
  );
}
