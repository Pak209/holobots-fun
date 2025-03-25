
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Ticket, ChevronRight, Trophy, AlertTriangle, Check } from "lucide-react";
import { HolobotSelect } from "@/components/HolobotSelect";
import { ArenaModeTier } from "./ArenaModeTier";

interface ArenaPrebattleMenuProps {
  onHolobotSelect: (holobotKey: string) => void;
  onEntryFeeMethod: (method: 'tokens' | 'pass') => void;
  onTierSelect: (tier: string) => void;
  entryFee: number;
  availableTiers: string[];
  arenaData: Record<string, any>;
  selectedTier: string | null;
}

export const ArenaPrebattleMenu: React.FC<ArenaPrebattleMenuProps> = ({
  onHolobotSelect,
  onEntryFeeMethod,
  onTierSelect,
  entryFee,
  availableTiers,
  arenaData,
  selectedTier
}) => {
  const { user } = useAuth();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'tokens' | 'pass' | null>(null);
  const [step, setStep] = useState<'holobot' | 'tier' | 'payment'>('holobot');

  const handleNextStep = () => {
    if (step === 'holobot' && selectedHolobot) {
      setStep('tier');
    } else if (step === 'tier' && selectedTier) {
      setStep('payment');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'tier') {
      setStep('holobot');
    } else if (step === 'payment') {
      setStep('tier');
    }
  };

  const handleSelectHolobot = (holobot: string) => {
    setSelectedHolobot(holobot);
    onHolobotSelect(holobot);
  };

  const handleSelectTier = (tier: string) => {
    onTierSelect(tier);
  };

  const handleConfirm = () => {
    if (selectedMethod) {
      onEntryFeeMethod(selectedMethod);
    }
  };

  const EntranceFeeSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Entry Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant={selectedMethod === 'tokens' ? 'default' : 'outline'}
          className={`h-auto py-4 flex flex-col items-center gap-2 ${
            selectedMethod === 'tokens' ? 'border-2 border-holobots-accent' : ''
          }`}
          disabled={!user || (user.holosTokens || 0) < entryFee}
          onClick={() => setSelectedMethod('tokens')}
        >
          <Coins className="h-8 w-8 text-yellow-400" />
          <div className="text-center">
            <p className="font-bold">{entryFee} HOLOS Tokens</p>
            <p className="text-xs text-gray-400 mt-1">
              Available: {user?.holosTokens || 0}
            </p>
          </div>
        </Button>

        <Button
          variant={selectedMethod === 'pass' ? 'default' : 'outline'}
          className={`h-auto py-4 flex flex-col items-center gap-2 ${
            selectedMethod === 'pass' ? 'border-2 border-holobots-accent' : ''
          }`}
          disabled={!user || (user?.arena_passes || 0) <= 0}
          onClick={() => setSelectedMethod('pass')}
        >
          <Ticket className="h-8 w-8 text-purple-400" />
          <div className="text-center">
            <p className="font-bold">Arena Pass</p>
            <p className="text-xs text-gray-400 mt-1">
              Available: {user?.arena_passes || 0}
            </p>
          </div>
        </Button>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={handlePreviousStep}>
          Back
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedMethod}
          className="bg-holobots-accent hover:bg-holobots-hover text-black"
        >
          Enter Arena <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="bg-holobots-card border-holobots-border shadow-neon">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Arena Battle
        </CardTitle>
        <CardDescription>
          Compete against other Holobots to earn rewards and climb the ranks
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 'holobot' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Select Your Holobot</h3>
            <div className="bg-black/20 rounded-lg p-3 mb-4">
              <HolobotSelect
                onSelect={handleSelectHolobot}
                selectedHolobot={selectedHolobot || ""}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleNextStep}
                disabled={!selectedHolobot}
                className="bg-holobots-accent hover:bg-holobots-hover text-black"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {step === 'tier' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Select Arena Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(arenaData).map(([tier, data]) => (
                <ArenaModeTier
                  key={tier}
                  tier={tier}
                  data={data}
                  onSelect={handleSelectTier}
                  isSelected={selectedTier === tier}
                  isLocked={!availableTiers.includes(tier)}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!selectedTier}
                className="bg-holobots-accent hover:bg-holobots-hover text-black"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && <EntranceFeeSection />}
      </CardContent>

      <CardFooter className="flex-col space-y-2 text-sm bg-black/20 rounded-b-lg">
        <div className="flex items-start gap-2 text-yellow-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Arena battles consume energy and provide valuable rewards. Higher tiers offer better rewards but feature stronger opponents.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
