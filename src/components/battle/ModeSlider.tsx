import { Shield, Sword } from "lucide-react";

interface ModeSliderProps {
  isDefense: boolean;
  onModeChange: (isDefense: boolean) => void;
  disabled?: boolean;
}

export const ModeSlider = ({ isDefense, onModeChange, disabled = false }: ModeSliderProps) => {
  return (
    <div 
      onClick={() => !disabled && onModeChange(!isDefense)}
      className={`relative w-32 h-12 cursor-pointer rounded-full bg-holobots-card border-2 border-holobots-border 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neon-blue'}`}
    >
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 
          ${isDefense ? 'bg-blue-500 left-0' : 'bg-red-500 right-0'}
          rounded-full transition-all duration-300 ease-in-out
          flex items-center justify-center shadow-neon-blue`}
      >
        {isDefense ? (
          <Shield className="w-6 h-6 text-white" />
        ) : (
          <Sword className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-holobots-text">
          {isDefense ? 'DEFENSE' : 'ATTACK'}
        </span>
      </div>
    </div>
  );
};