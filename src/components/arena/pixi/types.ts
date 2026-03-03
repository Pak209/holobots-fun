// ============================================================================
// PixiJS Battle Scene Types
// Shared types for React <-> Pixi communication
// ============================================================================

export interface BattleSceneConfig {
  width: number;
  height: number;
  backgroundColor: number;
  pixelated: boolean;
  backgroundImageUrl?: string;
}

export interface FighterSpriteData {
  id: string;
  position: 'left' | 'right';
  texture: string;
  scale: number;
}

export interface AnimationEvent {
  type: 'animationComplete' | 'hitLanded' | 'attackStarted' | 'koTriggered';
  data?: Record<string, any>;
}

export interface AttackAnimationParams {
  attackerId: string;
  defenderId: string;
  damageAmount: number;
  attackType: 'strike' | 'combo' | 'special' | 'finisher';
}

export interface HitEffectParams {
  targetId: string;
  intensity: 'light' | 'medium' | 'heavy';
}

export interface ScreenShakeParams {
  intensity: number; // 0-10
  duration: number; // milliseconds
}

export type BattleSceneEventListener = (event: AnimationEvent) => void;
