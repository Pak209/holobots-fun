
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

interface BattleSelectorsProps {
  selectedLeftHolobot: string;
  selectedRightHolobot: string;
  onLeftSelect: (value: string) => void;
  onRightSelect: (value: string) => void;
}

export const BattleSelectors = ({
  selectedLeftHolobot,
  selectedRightHolobot,
  onLeftSelect,
  onRightSelect
}: BattleSelectorsProps) => {
  // Helper function to get the correct image path for each holobot
  const getHolobotImagePath = (key: string) => {
    const normalizedKey = key.toLowerCase();
    
    // Direct mapping for Holobot images to ensure they load correctly
    // Each key is the holobot key from HOLOBOT_STATS and each value is the correct image path
    const holobotImageMap: Record<string, string> = {
      "ace": "/lovable-uploads/26ccfc85-75a9-45fe-916d-52221d0114ca.png",
      "kuma": "/lovable-uploads/8538db67-52ba-404c-be52-f3bba93b356c.png",
      "shadow": "/lovable-uploads/85a2cf79-1889-472d-9855-3048f24a5597.png",
      "era": "/lovable-uploads/433db76f-724b-484e-bd07-b01fde68f661.png", 
      "hare": "/lovable-uploads/c4359243-8486-4c66-9a1b-ee1f00a53fc6.png",
      "tora": "/lovable-uploads/7d5945ea-d44a-4028-8455-8f5f017fa601.png",
      "wake": "/lovable-uploads/538299bd-064f-4e42-beb2-cfc90c89efd2.png",
      "gama": "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png",
      "ken": "/lovable-uploads/3166d0da-114f-4b4b-8c65-79fc3f4e4789.png",
      "kurai": "/lovable-uploads/43352190-0af0-4ad7-aa3b-031a7a735552.png",
      "tsuin": "/lovable-uploads/dfc882db-6efe-449a-9a18-d58975a0799d.png",
      "wolf": "/lovable-uploads/fb0ae83c-7473-463b-a994-8d6fac2aca3c.png"
    };
    
    // First check if the key is directly in our mapping
    if (normalizedKey in holobotImageMap) {
      return holobotImageMap[normalizedKey];
    }
    
    console.log(`No direct mapping found for ${normalizedKey}, falling back to placeholder`);
    return "/placeholder.svg";
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="block md:hidden bg-holobots-card border-holobots-border text-holobots-accent hover:bg-holobots-hover hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-holobots-background border-holobots-border">
          <div className="flex flex-col gap-4 pt-4">
            <Select value={selectedLeftHolobot} onValueChange={onLeftSelect}>
              <SelectTrigger className="bg-holobots-card text-white border-holobots-border">
                <SelectValue placeholder="Choose Holobot" />
              </SelectTrigger>
              <SelectContent className="bg-holobots-card border-holobots-border">
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem 
                    key={key} 
                    value={key} 
                    className="text-white hover:bg-holobots-hover flex items-center gap-2"
                  >
                    <img 
                      src={getHolobotImagePath(key)}
                      alt={stats.name} 
                      className="w-6 h-6 object-contain" 
                      onError={(e) => {
                        console.error(`Failed to load thumbnail for ${key}`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    {stats.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRightHolobot} onValueChange={onRightSelect}>
              <SelectTrigger className="bg-holobots-card text-white border-holobots-border">
                <SelectValue placeholder="Choose Enemy" />
              </SelectTrigger>
              <SelectContent className="bg-holobots-card border-holobots-border">
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem 
                    key={key} 
                    value={key} 
                    className="text-white hover:bg-holobots-hover flex items-center gap-2"
                  >
                    <img 
                      src={getHolobotImagePath(key)}
                      alt={stats.name} 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        console.error(`Failed to load thumbnail for ${key}`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    {stats.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="hidden md:flex gap-4">
        <Select value={selectedLeftHolobot} onValueChange={onLeftSelect}>
          <SelectTrigger className="w-32 bg-holobots-card text-white border-holobots-border">
            <SelectValue placeholder="Choose Holobot" />
          </SelectTrigger>
          <SelectContent className="bg-holobots-card border-holobots-border">
            {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
              <SelectItem 
                key={key} 
                value={key} 
                className="text-white hover:bg-holobots-hover flex items-center gap-2"
              >
                <img 
                  src={getHolobotImagePath(key)}
                  alt={stats.name} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    console.error(`Failed to load thumbnail for ${key}`);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {stats.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedRightHolobot} onValueChange={onRightSelect}>
          <SelectTrigger className="w-32 bg-holobots-card text-white border-holobots-border">
            <SelectValue placeholder="Choose Enemy" />
          </SelectTrigger>
          <SelectContent className="bg-holobots-card border-holobots-border">
            {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
              <SelectItem 
                key={key} 
                value={key} 
                className="text-white hover:bg-holobots-hover flex items-center gap-2"
              >
                <img 
                  src={getHolobotImagePath(key)}
                  alt={stats.name} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    console.error(`Failed to load thumbnail for ${key}`);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {stats.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
