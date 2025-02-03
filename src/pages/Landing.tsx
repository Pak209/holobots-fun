import { Navbar } from "@/components/Navbar";
import { Characters } from "@/components/Characters";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Characters />
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          Welcome to Holobots Battle Arena
        </h1>
        <p className="text-center text-muted-foreground mb-4">
          Choose your Holobot and prepare for battle!
        </p>
      </div>
    </div>
  );
};

export default Landing;
