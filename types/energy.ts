export interface EnergyState {
  current: number;
  max: number;
  availableRefills: number;
  lastRefillTime?: string;
}

export interface EnergyRefillItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  expiresAt?: string;
}

export interface EnergyRefillResponse {
  success: boolean;
  newEnergy: number;
  remainingRefills: number;
  error?: string;
} 