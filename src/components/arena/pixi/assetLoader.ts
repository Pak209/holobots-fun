// ============================================================================
// Asset Loader - Helper for loading sprite animation sequences
// ============================================================================

import * as PIXI from 'pixi.js';

export interface SpriteSequenceConfig {
  holobotName: string; // e.g. 'shadow', 'ace', 'kuma'
  animations: {
    [key: string]: {
      frameCount: number;
      framePattern: string; // e.g. 'frame_####.png' where #### is padded number
    };
  };
}

/**
 * Load a sequence of PNG frames as textures
 * @param basePath - e.g. '/assets/sprites/shadow/idle/'
 * @param frameCount - number of frames
 * @param framePattern - pattern like 'frame_####.png'
 * @returns Array of PIXI.Texture
 */
export async function loadFrameSequence(
  basePath: string,
  frameCount: number,
  framePattern: string = 'frame_####.png'
): Promise<PIXI.Texture[]> {
  const textures: PIXI.Texture[] = [];
  
  try {
    for (let i = 0; i < frameCount; i++) {
      // Generate frame filename with padding
      const frameNum = String(i + 1).padStart(4, '0');
      const filename = framePattern.replace('####', frameNum);
      const path = `${basePath}${filename}`;
      
      try {
        const texture = await PIXI.Assets.load(path);
        
        // Set to nearest neighbor for pixel-perfect rendering
        if (texture && texture.source) {
          texture.source.scaleMode = 'nearest';
        }
        
        textures.push(texture);
      } catch (error) {
        console.warn(`[AssetLoader] Failed to load frame: ${path}`);
        // Continue loading other frames
      }
    }
    
    console.log(`[AssetLoader] Loaded ${textures.length}/${frameCount} frames from ${basePath}`);
  } catch (error) {
    console.error('[AssetLoader] Error loading frame sequence:', error);
  }
  
  return textures;
}

/**
 * Load all animations for a Holobot
 */
export async function loadHolobotAnimations(config: SpriteSequenceConfig): Promise<{
  idle?: PIXI.Texture[];
  strike?: PIXI.Texture[];
  block?: PIXI.Texture[];
  hit?: PIXI.Texture[];
  ko?: PIXI.Texture[];
}> {
  const animations: Record<string, PIXI.Texture[]> = {};
  
  for (const [action, settings] of Object.entries(config.animations)) {
    const basePath = `/assets/sprites/${config.holobotName}/${action}/`;
    const frames = await loadFrameSequence(
      basePath,
      settings.frameCount,
      settings.framePattern
    );
    
    if (frames.length > 0) {
      animations[action] = frames;
    }
  }
  
  return animations;
}

/**
 * Generate fallback sprite texture (colored rectangle)
 */
export function createFallbackTexture(color: number, width: number = 24, height: number = 32): PIXI.Texture {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(color);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();
  
  // Create texture from graphics
  const renderer = PIXI.autoDetectRenderer();
  const texture = renderer.generateTexture(graphics);
  
  return texture;
}
