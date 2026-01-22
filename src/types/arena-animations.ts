// ============================================================================
// Arena V2 Animation Types
// Animation states, triggers, and configurations
// ============================================================================

export type AnimationType = 
  | 'strike'
  | 'defense'
  | 'combo'
  | 'finisher'
  | 'damage'
  | 'heal'
  | 'status_effect'
  | 'entrance'
  | 'victory'
  | 'defeat';

export type AnimationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AnimationConfig {
  id: string;
  type: AnimationType;
  duration: number; // milliseconds
  priority: AnimationPriority;
  
  // Timing
  delay: number; // ms before animation starts
  interruptible: boolean;
  
  // Visual
  spriteSheet?: string;
  lottieUrl?: string;
  particleEffects?: ParticleEffect[];
  cameraShake?: CameraShake;
  
  // Audio
  sfxId?: string;
  sfxVolume?: number;
  
  // Hooks
  onStart?: () => void;
  onComplete?: () => void;
  onInterrupt?: () => void;
}

export interface ParticleEffect {
  type: 'fire' | 'ice' | 'lightning' | 'impact' | 'sparks' | 'blood' | 'energy' | 'smoke';
  position: { x: number; y: number };
  duration: number;
  intensity: number;
  color?: string;
}

export interface CameraShake {
  intensity: number; // 0-1
  duration: number; // ms
  frequency: number; // shakes per second
}

export interface DamageNumber {
  id: string;
  value: number;
  position: { x: number; y: number };
  isCritical: boolean;
  isHeal: boolean;
  color: string;
  fadeOutDuration: number;
}

export interface AnimationQueue {
  queue: AnimationConfig[];
  current: AnimationConfig | null;
  isPlaying: boolean;
}
