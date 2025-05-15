import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface HolobotBlueprintInfo {
  key: string;
  name: string;
  currentBlueprints: number;
}

interface BlueprintConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBlueprintFragments: number;
  availableHolobotTypes: HolobotBlueprintInfo[];
  onConfirmConversion: (selectedHolobotTypeKey: string) => void;
  isLoading?: boolean;
}

export const BlueprintConversionModal: React.FC<BlueprintConversionModalProps> = ({
  isOpen,
  onClose,
  userBlueprintFragments,
  availableHolobotTypes,
  onConfirmConversion,
  isLoading = false,
}) => {
  const fragmentsNeeded = 10;
  const canConvert = userBlueprintFragments >= fragmentsNeeded;
  const [selectedHolobotKey, setSelectedHolobotKey] = useState<string>("");

  useEffect(() => {
    if (isOpen && availableHolobotTypes.length > 0 && !selectedHolobotKey) {
      setSelectedHolobotKey(availableHolobotTypes[0].key);
    }
    if (!isOpen) {
      setSelectedHolobotKey("");
    }
  }, [isOpen, availableHolobotTypes, selectedHolobotKey]);

  const handleConfirm = () => {
    if (selectedHolobotKey) {
      onConfirmConversion(selectedHolobotKey);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] border-holobots-border text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-orbitron">Convert Blueprint Fragments</DialogTitle>
          <DialogDescription className="text-gray-400">
            Use your generic Blueprint Fragments to add pieces to a specific Holobot's Blueprint.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-center mb-4">
            <p className="text-lg">You have: <span className="font-bold text-yellow-400">{userBlueprintFragments}</span> generic Blueprint Fragments</p>
            <p className="text-sm text-gray-500">You need {fragmentsNeeded} generic fragments to add 1 piece to the selected Holobot Blueprint.</p>
          </div>

          {availableHolobotTypes.length > 0 ? (
            <div className="space-y-2">
              <label htmlFor="holobot-select" className="text-sm font-medium text-gray-300">Select Holobot Blueprint to add a piece to:</label>
              <Select value={selectedHolobotKey} onValueChange={setSelectedHolobotKey}>
                <SelectTrigger id="holobot-select" className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a Holobot..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {availableHolobotTypes.map((holobot) => (
                    <SelectItem key={holobot.key} value={holobot.key} className="hover:bg-gray-700 focus:bg-gray-700">
                      {holobot.name} (Current Pieces: {holobot.currentBlueprints})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-center text-orange-400">No Holobot types available for blueprint creation.</p>
          )}

        </div>
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={onClose} 
            className="text-white border-gray-600 hover:bg-gray-700/50"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canConvert || !selectedHolobotKey || isLoading}
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {isLoading ? "Converting..." : `Convert ${fragmentsNeeded} Fragments`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 