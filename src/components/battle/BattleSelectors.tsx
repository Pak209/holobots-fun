
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
                  <SelectItem key={key} value={key} className="text-white hover:bg-holobots-hover">
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
                  <SelectItem key={key} value={key} className="text-white hover:bg-holobots-hover">
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
              <SelectItem key={key} value={key} className="text-white hover:bg-holobots-hover">
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
              <SelectItem key={key} value={key} className="text-white hover:bg-holobots-hover">
                {stats.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
