// ============================================================================
// ArenaCanvas - React wrapper for PixiJS Battle Scene
// Manages Pixi lifecycle and exposes animation API via ref
// ============================================================================

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { BattleScene } from './BattleScene';
import battleBg from '@/assets/icons/battlescreenBG.png';
import type {
  BattleSceneConfig,
  FighterSpriteData,
  AttackAnimationParams,
  HitEffectParams,
  ScreenShakeParams,
  AnimationEvent,
} from './types';

interface ArenaCanvasProps {
  width?: number;
  height?: number;
  onAnimationEvent?: (event: AnimationEvent) => void;
}

export interface ArenaCanvasHandle {
  playAttack: (params: AttackAnimationParams) => Promise<void>;
  playBlock: () => Promise<void>;
  playHit: (params: HitEffectParams) => Promise<void>;
  playKO: () => Promise<void>;
  screenShake: (params: ScreenShakeParams) => void;
}

export const ArenaCanvas = forwardRef<ArenaCanvasHandle, ArenaCanvasProps>(
  ({ width = 640, height = 360, onAnimationEvent }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<BattleScene | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Pixi on mount
    useEffect(() => {
      if (!canvasRef.current) return;

      const config: BattleSceneConfig = {
        width,
        height,
        backgroundColor: 0x0a0a0f,
        pixelated: true,
        backgroundImageUrl: battleBg,
      };

      const scene = new BattleScene(canvasRef.current, config);
      sceneRef.current = scene;

      // Setup event listener
      if (onAnimationEvent) {
        scene.addEventListener(onAnimationEvent);
      }

      // Initialize scene
      const initScene = async () => {
        console.log('[ArenaCanvas] Initializing scene...');
        
        try {
          // Wait for Pixi app to be ready
          await scene.waitForInit();
          console.log('[ArenaCanvas] Pixi app ready');
          
          // Load assets
          await scene.loadAssets();
          console.log('[ArenaCanvas] Assets loaded');
          
          // Create background
          scene.createBackground();
          console.log('[ArenaCanvas] Background created');
          
          // Create fighters (now async)
          await scene.createFighters(
            {
              id: 'player',
              position: 'left',
              texture: 'player',
              scale: 2,
            },
            {
              id: 'opponent',
              position: 'right',
              texture: 'opponent',
              scale: 2,
            }
          );
          console.log('[ArenaCanvas] Fighters created');
        } catch (error) {
          console.error('[ArenaCanvas] Failed to initialize scene:', error);
        }
      };

      initScene();

      // Cleanup on unmount
      return () => {
        if (onAnimationEvent && sceneRef.current) {
          sceneRef.current.removeEventListener(onAnimationEvent);
        }
        sceneRef.current?.destroy();
        sceneRef.current = null;
      };
    }, [width, height, onAnimationEvent]);

    // Handle resize
    useEffect(() => {
      const handleResize = () => {
        if (sceneRef.current && containerRef.current) {
          const container = containerRef.current;
          const newWidth = container.clientWidth;
          const newHeight = container.clientHeight;
          sceneRef.current.resize(newWidth, newHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Expose animation methods via ref
    useImperativeHandle(ref, () => ({
      playAttack: async (params: AttackAnimationParams) => {
        if (!sceneRef.current) return;
        await sceneRef.current.playAttack(params);
      },
      playBlock: async () => {
        if (!sceneRef.current) return;
        await sceneRef.current.playBlock();
      },
      playHit: async (params: HitEffectParams) => {
        if (!sceneRef.current) return;
        await sceneRef.current.playHit(params);
      },
      playKO: async () => {
        if (!sceneRef.current) return;
        await sceneRef.current.playKO();
      },
      screenShake: (params: ScreenShakeParams) => {
        if (!sceneRef.current) return;
        sceneRef.current.screenShake(params);
      },
    }));

    return (
      <div
        ref={containerRef}
        className="relative w-full bg-black border-3 border-[#F5C400] overflow-hidden"
        style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          minHeight: '280px',
          maxHeight: '360px',
          aspectRatio: '16/9',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            imageRendering: 'pixelated',
          } as React.CSSProperties}
        />
      </div>
    );
  }
);

ArenaCanvas.displayName = 'ArenaCanvas';
