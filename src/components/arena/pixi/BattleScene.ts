// ============================================================================
// BattleScene - Pure PixiJS Battle Rendering
// Handles all WebGL rendering, sprites, and animations
// ============================================================================

import * as PIXI from 'pixi.js';
import { HolobotSprite } from './HolobotSprite';
import { loadHolobotAnimations, createFallbackTexture } from './assetLoader';
import type {
  BattleSceneConfig,
  FighterSpriteData,
  AnimationEvent,
  AttackAnimationParams,
  HitEffectParams,
  ScreenShakeParams,
  BattleSceneEventListener,
} from './types';

export class BattleScene {
  private app: PIXI.Application;
  private container!: PIXI.Container;
  private backgroundSprite: PIXI.Sprite | null = null;
  private playerHolobot: HolobotSprite | null = null;
  private opponentHolobot: HolobotSprite | null = null;
  
  private eventListeners: BattleSceneEventListener[] = [];
  private isAnimating = false;
  private config: BattleSceneConfig;
  private initPromise: Promise<void>;
  
  private readonly INTERNAL_WIDTH = 320;
  private readonly INTERNAL_HEIGHT = 180;
  
  constructor(canvas: HTMLCanvasElement, config: BattleSceneConfig) {
    this.config = config;
    console.log('[BattleScene] Constructor called with config:', config);
    
    // Initialize Pixi Application with pixel-perfect settings
    this.app = new PIXI.Application();
    
    // Store initialization promise
    this.initPromise = this.app.init({
      canvas,
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      antialias: false,
      resolution: 1,
      autoDensity: false,
      preference: 'webgl',
    }).then(() => {
      console.log('[BattleScene] Pixi app initialized successfully');
      
      // Create main container
      this.container = new PIXI.Container();
      this.app.stage.addChild(this.container);
      
      console.log('[BattleScene] Container created and added to stage');
      
      // Scale container to maintain pixel-perfect look
      const scaleX = config.width / this.INTERNAL_WIDTH;
      const scaleY = config.height / this.INTERNAL_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      
      this.container.scale.set(scale);
      
      // Center container
      this.container.position.set(
        (config.width - this.INTERNAL_WIDTH * scale) / 2,
        (config.height - this.INTERNAL_HEIGHT * scale) / 2
      );
      
      console.log('[BattleScene] Container scaled and positioned. Scale:', scale);
    }).catch((error) => {
      console.error('[BattleScene] Failed to initialize Pixi app:', error);
      throw error;
    });
  }
  
  // Ensure app is ready before any operations
  async waitForInit(): Promise<void> {
    await this.initPromise;
  }

  // ============================================================================
  // Asset Loading
  // ============================================================================

  async loadAssets(): Promise<void> {
    try {
      // Load background if URL provided
      if (this.config.backgroundImageUrl) {
        console.log('[BattleScene] Loading background from:', this.config.backgroundImageUrl);
        
        const texture = await PIXI.Assets.load({
          alias: 'background',
          src: this.config.backgroundImageUrl,
        });
        
        console.log('[BattleScene] Background texture loaded:', texture);
        
        // Set to nearest neighbor for pixel-perfect rendering
        if (texture && texture.source) {
          texture.source.scaleMode = 'nearest';
        }
        
        console.log('[BattleScene] Background configured for pixel-perfect rendering');
      }
      
      console.log('[BattleScene] All assets loaded');
    } catch (error) {
      console.error('[BattleScene] Failed to load assets:', error);
    }
  }

  // ============================================================================
  // Scene Setup
  // ============================================================================

  createBackground(): void {
    console.log('[BattleScene] Creating background...');
    
    try {
      // Try to get the battle background texture
      const bgTexture = PIXI.Assets.get('background');
      
      console.log('[BattleScene] Background texture:', bgTexture);
      
      if (bgTexture) {
        this.backgroundSprite = new PIXI.Sprite(bgTexture);
        
        console.log('[BattleScene] Background sprite created, size:', bgTexture.width, 'x', bgTexture.height);
        
        // Scale to fit internal resolution while maintaining aspect ratio
        const scaleX = this.INTERNAL_WIDTH / bgTexture.width;
        const scaleY = this.INTERNAL_HEIGHT / bgTexture.height;
        const scale = Math.max(scaleX, scaleY); // Cover the entire area
        
        this.backgroundSprite.scale.set(scale);
        
        // Center the background
        this.backgroundSprite.position.set(
          (this.INTERNAL_WIDTH - bgTexture.width * scale) / 2,
          (this.INTERNAL_HEIGHT - bgTexture.height * scale) / 2
        );
        
        // Make sure it's at the back
        this.container.addChildAt(this.backgroundSprite, 0);
        
        console.log('[BattleScene] Background image loaded and added to stage');
        console.log('[BattleScene] Scale:', scale, 'Position:', this.backgroundSprite.position.x, this.backgroundSprite.position.y);
        return;
      } else {
        console.warn('[BattleScene] Background texture not found in Assets cache');
      }
    } catch (error) {
      console.error('[BattleScene] Error creating background:', error);
    }
    
    // Fallback: Create gradient background
    console.log('[BattleScene] Using fallback gradient background');
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x1a1a2e);
    graphics.drawRect(0, 0, this.INTERNAL_WIDTH, this.INTERNAL_HEIGHT);
    graphics.endFill();
    
    // Add gradient effect
    graphics.beginFill(0x16213e);
    graphics.drawRect(0, this.INTERNAL_HEIGHT * 0.6, this.INTERNAL_WIDTH, this.INTERNAL_HEIGHT * 0.4);
    graphics.endFill();
    
    this.container.addChild(graphics);
    
    console.log('[BattleScene] Fallback background created');
  }

  async createFighters(playerData: FighterSpriteData, opponentData: FighterSpriteData): Promise<void> {
    console.log('[BattleScene] Creating fighters...');
    
    // Try to load player animations
    let playerAnimations: any = {};
    try {
      playerAnimations = await loadHolobotAnimations({
        holobotName: 'shadow', // Default to Shadow, make configurable later
        animations: {
          idle: { frameCount: 8, framePattern: 'frame_####.png' },
          strike: { frameCount: 12, framePattern: 'frame_####.png' },
          block: { frameCount: 6, framePattern: 'frame_####.png' },
          hit: { frameCount: 4, framePattern: 'frame_####.png' },
          ko: { frameCount: 10, framePattern: 'frame_####.png' },
        },
      });
      console.log('[BattleScene] Player animations loaded:', Object.keys(playerAnimations));
    } catch (error) {
      console.warn('[BattleScene] Failed to load player animations, using fallback');
    }
    
    // Create fallback if no animations loaded
    if (!playerAnimations.idle || playerAnimations.idle.length === 0) {
      const fallbackTexture = createFallbackTexture(0x06b6d4);
      playerAnimations.idle = [fallbackTexture];
    }
    
    // Create player HolobotSprite
    this.playerHolobot = new HolobotSprite({
      id: 'player',
      position: { x: this.INTERNAL_WIDTH * 0.25, y: this.INTERNAL_HEIGHT * 0.6 },
      scale: 2.5,
      animations: playerAnimations,
      onAnimationComplete: (action) => {
        console.log('[BattleScene] Player animation complete:', action);
      },
    });
    this.container.addChild(this.playerHolobot.getContainer());
    
    // Try to load opponent animations (use same as player for now)
    let opponentAnimations: any = playerAnimations;
    
    // Create opponent HolobotSprite
    this.opponentHolobot = new HolobotSprite({
      id: 'opponent',
      position: { x: this.INTERNAL_WIDTH * 0.75, y: this.INTERNAL_HEIGHT * 0.6 },
      scale: 2.5,
      animations: opponentAnimations,
      onAnimationComplete: (action) => {
        console.log('[BattleScene] Opponent animation complete:', action);
      },
    });
    this.container.addChild(this.opponentHolobot.getContainer());
    
    console.log('[BattleScene] Fighters created with HolobotSprite');
  }

  // ============================================================================
  // Animation Methods
  // ============================================================================

  async playAttack(params: AttackAnimationParams): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const attackerHolobot = params.attackerId === 'player' ? this.playerHolobot : this.opponentHolobot;
    const defenderHolobot = params.attackerId === 'player' ? this.opponentHolobot : this.playerHolobot;
    
    if (!attackerHolobot || !defenderHolobot) {
      this.isAnimating = false;
      return;
    }
    
    this.emitEvent({ type: 'attackStarted', data: params });
    
    // Store original position
    const originalPos = attackerHolobot.getPosition();
    
    // Play attack animation on sprite
    attackerHolobot.playAction('strike');
    
    // Slide forward while animating
    const slideDistance = params.attackerId === 'player' ? 16 : -16;
    await this.animateHolobot(attackerHolobot, {
      x: originalPos.x + slideDistance,
      scale: 2.7,
    }, 200);
    
    // Hit pause (3 frames at 60fps = 50ms)
    await this.wait(50);
    
    // Flash defender white
    defenderHolobot.setTint(0xffffff);
    setTimeout(() => defenderHolobot.resetTint(), 100);
    
    // Screen shake based on attack type
    const shakeIntensity = this.getShakeIntensity(params.attackType);
    this.screenShake({ intensity: shakeIntensity, duration: 150 });
    
    this.emitEvent({ type: 'hitLanded', data: params });
    
    // Return to original position
    await this.animateHolobot(attackerHolobot, {
      x: originalPos.x,
      scale: 2.5,
    }, 200);
    
    this.isAnimating = false;
    this.emitEvent({ type: 'animationComplete', data: params });
  }

  async playBlock(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    // Play block animation and flash blue shield effect
    if (this.playerHolobot) {
      this.playerHolobot.playAction('block');
      this.playerHolobot.setTint(0x06b6d4);
      setTimeout(() => this.playerHolobot?.resetTint(), 200);
    }
    
    await this.wait(200);
    
    this.isAnimating = false;
    this.emitEvent({ type: 'animationComplete' });
  }

  async playHit(params: HitEffectParams): Promise<void> {
    const targetHolobot = params.targetId === 'player' ? this.playerHolobot : this.opponentHolobot;
    if (!targetHolobot) return;
    
    // Play hit animation
    targetHolobot.playAction('hit');
    
    // Knockback effect
    const originalPos = targetHolobot.getPosition();
    const knockbackDistance = params.targetId === 'player' ? -8 : 8;
    
    await this.animateHolobot(targetHolobot, {
      x: originalPos.x + knockbackDistance,
    }, 100);
    
    await this.animateHolobot(targetHolobot, {
      x: originalPos.x,
    }, 100);
  }

  async playKO(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const defeated = this.opponentHolobot;
    if (!defeated) {
      this.isAnimating = false;
      return;
    }
    
    // Play KO animation
    defeated.playAction('ko');
    
    // Flash red multiple times
    for (let i = 0; i < 3; i++) {
      defeated.setTint(0xff0000);
      setTimeout(() => defeated.resetTint(), 100);
      await this.wait(150);
    }
    
    // Fade out and scale down
    await this.animateHolobot(defeated, {
      alpha: 0,
      scale: 0.5,
    }, 500);
    
    this.isAnimating = false;
    this.emitEvent({ type: 'koTriggered' });
    this.emitEvent({ type: 'animationComplete' });
  }

  // ============================================================================
  // Visual Effects
  // ============================================================================

  screenShake(params: ScreenShakeParams): void {
    const originalX = this.container.position.x;
    const originalY = this.container.position.y;
    const startTime = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= params.duration) {
        this.container.position.set(originalX, originalY);
        return;
      }
      
      const intensity = params.intensity * (1 - elapsed / params.duration);
      const offsetX = (Math.random() - 0.5) * intensity * 2;
      const offsetY = (Math.random() - 0.5) * intensity * 2;
      
      this.container.position.set(originalX + offsetX, originalY + offsetY);
      
      requestAnimationFrame(shake);
    };
    
    shake();
  }


  private getShakeIntensity(attackType: string): number {
    switch (attackType) {
      case 'strike': return 2;
      case 'combo': return 4;
      case 'special': return 6;
      case 'finisher': return 8;
      default: return 2;
    }
  }

  // ============================================================================
  // Animation Helpers
  // ============================================================================

  private async animateHolobot(
    holobot: HolobotSprite,
    target: { x?: number; y?: number; scale?: number; alpha?: number },
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const container = holobot.getContainer();
      const startX = container.position.x;
      const startY = container.position.y;
      const startScale = container.scale.x;
      const startAlpha = container.alpha;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        if (target.x !== undefined) {
          container.position.x = startX + (target.x - startX) * eased;
        }
        if (target.y !== undefined) {
          container.position.y = startY + (target.y - startY) * eased;
        }
        if (target.scale !== undefined) {
          container.scale.set(startScale + (target.scale - startScale) * eased);
        }
        if (target.alpha !== undefined) {
          container.alpha = startAlpha + (target.alpha - startAlpha) * eased;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Event System
  // ============================================================================

  addEventListener(listener: BattleSceneEventListener): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: BattleSceneEventListener): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  private emitEvent(event: AnimationEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    
    const scaleX = width / this.INTERNAL_WIDTH;
    const scaleY = height / this.INTERNAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    this.container.scale.set(scale);
    this.container.position.set(
      (width - this.INTERNAL_WIDTH * scale) / 2,
      (height - this.INTERNAL_HEIGHT * scale) / 2
    );
  }

  destroy(): void {
    this.eventListeners = [];
    this.app.destroy(true, { children: true, texture: true });
    console.log('[BattleScene] Destroyed');
  }
}
