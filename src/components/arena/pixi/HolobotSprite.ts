// ============================================================================
// HolobotSprite - Animated Sprite Manager
// Manages idle loops and action animations for Holobots
// ============================================================================

import * as PIXI from 'pixi.js';

export interface HolobotSpriteConfig {
  id: string;
  position: { x: number; y: number };
  scale: number;
  animations: {
    idle?: PIXI.Texture[];
    strike?: PIXI.Texture[];
    block?: PIXI.Texture[];
    hit?: PIXI.Texture[];
    ko?: PIXI.Texture[];
  };
  onAnimationComplete?: (action: string) => void;
}

export class HolobotSprite {
  private container: PIXI.Container;
  private currentSprite: PIXI.AnimatedSprite | PIXI.Sprite;
  private animations: Map<string, PIXI.Texture[]>;
  private config: HolobotSpriteConfig;
  private isPlayingAction = false;
  
  constructor(config: HolobotSpriteConfig) {
    this.config = config;
    this.container = new PIXI.Container();
    this.animations = new Map();
    
    // Store animation textures
    if (config.animations.idle) {
      this.animations.set('idle', config.animations.idle);
    }
    if (config.animations.strike) {
      this.animations.set('strike', config.animations.strike);
    }
    if (config.animations.block) {
      this.animations.set('block', config.animations.block);
    }
    if (config.animations.hit) {
      this.animations.set('hit', config.animations.hit);
    }
    if (config.animations.ko) {
      this.animations.set('ko', config.animations.ko);
    }
    
    // Create initial sprite (idle or fallback)
    this.currentSprite = this.createSprite('idle');
    this.container.addChild(this.currentSprite);
    
    // Position and scale
    this.container.position.set(config.position.x, config.position.y);
    this.container.scale.set(config.scale);
    
    console.log('[HolobotSprite] Created sprite:', config.id);
  }
  
  private createSprite(action: string): PIXI.AnimatedSprite | PIXI.Sprite {
    const textures = this.animations.get(action);
    
    if (textures && textures.length > 0) {
      // Create animated sprite
      const animSprite = new PIXI.AnimatedSprite(textures);
      animSprite.anchor.set(0.5, 0.5);
      
      if (action === 'idle') {
        animSprite.animationSpeed = 0.15; // ~9 FPS for idle
        animSprite.loop = true;
        animSprite.play();
      } else {
        animSprite.animationSpeed = 0.3; // ~18 FPS for actions
        animSprite.loop = false;
        animSprite.onComplete = () => {
          this.onActionComplete(action);
        };
      }
      
      return animSprite;
    } else {
      // Fallback: create colored rectangle
      const graphics = new PIXI.Graphics();
      const color = this.config.id.includes('player') ? 0x06b6d4 : 0xef4444;
      graphics.beginFill(color);
      graphics.drawRect(-12, -16, 24, 32);
      graphics.endFill();
      
      const texture = PIXI.RenderTexture.create({ width: 24, height: 32 });
      const renderer = PIXI.autoDetectRenderer();
      if (renderer) {
        renderer.render({ container: graphics, target: texture });
      }
      
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      
      return sprite;
    }
  }
  
  private onActionComplete(action: string): void {
    console.log('[HolobotSprite] Action complete:', action);
    this.isPlayingAction = false;
    
    // Return to idle
    this.switchToAnimation('idle');
    
    // Notify callback
    if (this.config.onAnimationComplete) {
      this.config.onAnimationComplete(action);
    }
  }
  
  private switchToAnimation(action: string): void {
    // Remove current sprite
    this.container.removeChild(this.currentSprite);
    
    // Create and add new sprite
    this.currentSprite = this.createSprite(action);
    this.container.addChild(this.currentSprite);
    
    // Play if animated
    if (this.currentSprite instanceof PIXI.AnimatedSprite) {
      this.currentSprite.play();
    }
  }
  
  // Public API
  
  playAction(action: 'strike' | 'block' | 'hit' | 'ko'): void {
    if (this.isPlayingAction) {
      console.warn('[HolobotSprite] Already playing action, ignoring:', action);
      return;
    }
    
    console.log('[HolobotSprite] Playing action:', action);
    this.isPlayingAction = true;
    this.switchToAnimation(action);
  }
  
  returnToIdle(): void {
    if (!this.isPlayingAction) return;
    this.isPlayingAction = false;
    this.switchToAnimation('idle');
  }
  
  getContainer(): PIXI.Container {
    return this.container;
  }
  
  getSprite(): PIXI.AnimatedSprite | PIXI.Sprite {
    return this.currentSprite;
  }
  
  setTint(color: number): void {
    this.currentSprite.tint = color;
  }
  
  resetTint(): void {
    this.currentSprite.tint = 0xffffff;
  }
  
  setPosition(x: number, y: number): void {
    this.container.position.set(x, y);
  }
  
  getPosition(): { x: number; y: number } {
    return {
      x: this.container.position.x,
      y: this.container.position.y,
    };
  }
  
  setScale(scale: number): void {
    this.container.scale.set(scale);
  }
  
  destroy(): void {
    if (this.currentSprite instanceof PIXI.AnimatedSprite) {
      this.currentSprite.stop();
    }
    this.container.destroy({ children: true });
  }
}
