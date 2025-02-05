
import { NavigationMenu } from "@/components/NavigationMenu";
import { TrainingGrid } from "@/components/TrainingGrid";

const Training = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="text-2xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
      </nav>
      <NavigationMenu />
      <div className="container mx-auto p-4">
        <h1 className="text-center text-4xl font-bold italic bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover my-8">
          HOLOBOT TRAINING
        </h1>
        <TrainingGrid />
      </div>
    </div>
  );
};

export default Training;
