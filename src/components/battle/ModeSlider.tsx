
import { Shield, Sword } from "lucide-react";

interface ModeSliderProps {
  isDefense: boolean;
  onModeChange: (isDefense: boolean) => void;
  disabled?: boolean;
  onDefenseModeBoost?: () => void; // Prop to trigger defense mode boost effects
}

export const ModeSlider = ({ 
  isDefense, 
  onModeChange, 
  disabled = false,
  onDefenseModeBoost
}: ModeSliderProps) => {
  const handleModeChange = () => {
    if (disabled) return;
    
    try {
      // Call the onModeChange prop with the new mode value
      onModeChange(!isDefense);
      
      // If switching to defense mode, trigger the defense boost effect
      if (!isDefense && onDefenseModeBoost) {
        console.log("Triggering defense mode boost");
        onDefenseModeBoost();
      }
    } catch (error) {
      console.error("Error changing battle mode:", error);
    }
  };
  
  return (
    <div 
      onClick={handleModeChange}
      className={`relative w-24 md:w-32 h-10 md:h-12 cursor-pointer rounded-full bg-holobots-card border-2 border-holobots-border transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neon-blue'}`}
    >
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-8 md:w-10 h-8 md:h-10 
          ${isDefense ? 'bg-blue-500 left-0 ml-1' : 'bg-red-500 right-0 mr-1'}
          rounded-full transition-all duration-300 ease-in-out
          flex items-center justify-center shadow-neon-blue`}
      >
        {isDefense ? (
          <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
        ) : (
          <Sword className="w-5 h-5 md:w-6 md:h-6 text-white" />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs md:text-sm font-bold text-holobots-text">
          {isDefense ? 'DEFENSE' : 'ATTACK'}
        </span>
      </div>
    </div>
  );
};
