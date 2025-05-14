import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserHolobot } from "@/types/user"; // Ensure this path is correct
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable list if many holobots
import { Badge } from "@/components/ui/badge"; // To display rank

interface HolobotSelectModalProps {
  isOpen: boolean;
  holobots: UserHolobot[];
  onConfirm: (holobotName: string) => void;
  onClose: () => void;
  isLoading?: boolean; // To disable confirm button during operation
}

export const HolobotSelectModal: React.FC<HolobotSelectModalProps> = ({
  isOpen,
  holobots,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  const [selectedHolobotName, setSelectedHolobotName] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset selection when modal is opened or holobots list changes
    if (isOpen) {
      setSelectedHolobotName(null);
    }
  }, [isOpen, holobots]);

  const handleConfirm = () => {
    if (selectedHolobotName) {
      onConfirm(selectedHolobotName);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-holobots-card border-holobots-border text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-orbitron">Select Holobot to Rank Up</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a Holobot to use your Rank Skip item on. Only Holobots not at maximum rank are shown.
          </DialogDescription>
        </DialogHeader>
        
        {holobots.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No eligible Holobots found for rank up.</p>
        ) : (
          <ScrollArea className="max-h-[300px] my-4 pr-3"> {/* Added pr-3 for scrollbar spacing */}
            <div className="space-y-2">
              {holobots.map((holobot) => (
                <Button
                  key={holobot.name}
                  variant={selectedHolobotName === holobot.name ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-2 px-3 
                              ${selectedHolobotName === holobot.name 
                                ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-700' 
                                : 'bg-black/30 border-gray-700 hover:bg-gray-700/70'}`}
                  onClick={() => setSelectedHolobotName(holobot.name)}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{holobot.name}</span>
                    <span className="text-xs text-gray-300">
                      Current Rank: <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs bg-slate-600 text-slate-100">{holobot.rank || 'Common'}</Badge>
                       {' | '} Level: {holobot.level}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:bg-gray-700">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedHolobotName || isLoading || holobots.length === 0}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500"
          >
            {isLoading ? "Processing..." : "Confirm Rank Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 