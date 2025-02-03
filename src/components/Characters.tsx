import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Shield, Zap } from "lucide-react";

type Character = {
  id: number;
  name: string;
  image: string;
  description: string;
  role: string;
  icon: React.ReactNode;
};

const characters: Character[] = [
  {
    id: 1,
    name: "Kuma",
    image: "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png",
    description: "A powerful bear-like robot with enhanced strength and defensive capabilities. Equipped with energy claws for close combat.",
    role: "Tank",
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 2,
    name: "Ace",
    image: "/lovable-uploads/a8cd74c8-4e2e-4f29-8b1c-913657f0ae03.png",
    description: "An agile combat specialist with advanced aerial capabilities. Features powerful mechanical boxing skills and tactical combat systems.",
    role: "Assault",
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 3,
    name: "Shadow",
    image: "/lovable-uploads/60586301-1d5a-471c-92b8-72e2d0f7c311.png",
    description: "A stealth-focused warrior equipped with energy blade technology and advanced cloaking systems.",
    role: "Infiltrator",
    icon: <Bot className="w-6 h-6" />
  }
];

export function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-accent/5" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Holobot
          </h2>
          <p className="text-muted-foreground text-lg">
            Select your mechanical warrior and master their unique abilities
          </p>
        </div>

        {/* Character Icons */}
        <div className="flex justify-center gap-4 mb-12">
          {characters.map((character) => (
            <motion.button
              key={character.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCharacter(character)}
              className={`relative rounded-full p-1 ${
                selectedCharacter.id === character.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-accent overflow-hidden flex items-center justify-center">
                {character.icon}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Character Info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCharacter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Character Image */}
                  <div className="bg-accent/10 p-6 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full aspect-square"
                    >
                      <img 
                        src={selectedCharacter.image}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </div>

                  {/* Character Info */}
                  <div className="p-6">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <h3 className="text-2xl font-bold mb-2">{selectedCharacter.name}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                        {selectedCharacter.icon}
                        <span>{selectedCharacter.role}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {selectedCharacter.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}