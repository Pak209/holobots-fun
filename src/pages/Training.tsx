import { NavigationMenu } from "@/components/NavigationMenu";
import { TrainingGrid } from "@/components/TrainingGrid";

const Training = () => {
  return (
    <div className="min-h-screen bg-retro-background text-white">
      <NavigationMenu />
      <div className="container mx-auto p-4">
        <h1 className="text-center text-4xl font-bold text-retro-accent my-8">HOLOBOT TRAINING</h1>
        <TrainingGrid />
      </div>
    </div>
  );
};

export default Training;