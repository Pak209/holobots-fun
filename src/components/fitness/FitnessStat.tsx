
import { ReactNode } from "react";

export type FitnessStatIcon = ReactNode;

export interface FitnessStatProps {
  icon: FitnessStatIcon;
  label: string;
  value: string;
  className?: string;
}

export const FitnessStat = ({ icon, label, value, className = "" }: FitnessStatProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-holobots-card/50 border border-holobots-border/20 rounded-lg ${className}`}>
      <div className="mb-2 text-holobots-accent">{icon}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
};
