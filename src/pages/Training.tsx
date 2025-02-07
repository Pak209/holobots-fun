
import { NavigationMenu } from "@/components/NavigationMenu";
import { TrainingGrid } from "@/components/TrainingGrid";

const Training = () => {
  return (
    <div className="min-h-screen bg-holobots-background text-white">
      <NavigationMenu />
      <div className="container mx-auto p-4">
        <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent my-8">
          HOLOBOT TRAINING
        </h1>
        <TrainingGrid />
      </div>
    </div>
  );
};

export default Training;
