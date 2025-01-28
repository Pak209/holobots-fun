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
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="block md:hidden bg-cyberpunk-card border-cyberpunk-border text-cyberpunk-primary hover:bg-cyberpunk-dark hover:text-cyberpunk-secondary"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-cyberpunk-background border-cyberpunk-border">
          <div className="flex flex-col gap-4 pt-4">
            <Select value={selectedLeftHolobot} onValueChange={onLeftSelect}>
              <SelectTrigger className="bg-cyberpunk-card text-cyberpunk-light border-cyberpunk-border">
                <SelectValue placeholder="Choose Holobot" />
              </SelectTrigger>
              <SelectContent className="bg-cyberpunk-card border-cyberpunk-border">
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem key={key} value={key} className="text-cyberpunk-light hover:bg-cyberpunk-dark">
                    {stats.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRightHolobot} onValueChange={onRightSelect}>
              <SelectTrigger className="bg-cyberpunk-card text-cyberpunk-light border-cyberpunk-border">
                <SelectValue placeholder="Choose Enemy" />
              </SelectTrigger>
              <SelectContent className="bg-cyberpunk-card border-cyberpunk-border">
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem key={key} value={key} className="text-cyberpunk-light hover:bg-cyberpunk-dark">
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
          <SelectTrigger className="w-32 bg-cyberpunk-card text-cyberpunk-light border-cyberpunk-border">
            <SelectValue placeholder="Choose Holobot" />
          </SelectTrigger>
          <SelectContent className="bg-cyberpunk-card border-cyberpunk-border">
            {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
              <SelectItem key={key} value={key} className="text-cyberpunk-light hover:bg-cyberpunk-dark">
                {stats.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedRightHolobot} onValueChange={onRightSelect}>
          <SelectTrigger className="w-32 bg-cyberpunk-card text-cyberpunk-light border-cyberpunk-border">
            <SelectValue placeholder="Choose Enemy" />
          </SelectTrigger>
          <SelectContent className="bg-cyberpunk-card border-cyberpunk-border">
            {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
              <SelectItem key={key} value={key} className="text-cyberpunk-light hover:bg-cyberpunk-dark">
                {stats.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};