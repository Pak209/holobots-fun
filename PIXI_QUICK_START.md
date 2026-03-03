# PixiJS Battle System - Quick Start Guide

## 🚀 Getting Started

The PixiJS battle system is now fully integrated into Arena V2 with **sprite animation support**!

## ⭐ NEW: Sprite Animation System

**✨ Latest Update:** HolobotSprite system implemented!

- ✅ **PNG frame sequences** automatically loaded and played
- ✅ **Idle loop animations** (continuous)
- ✅ **Action animations** (strike, block, hit, ko) play once then return to idle
- ✅ **Automatic fallback** to colored rectangles if no PNG frames found
- ✅ **Pixel-perfect rendering** with nearest-neighbor scaling

**Key Files:**
- `src/components/arena/pixi/HolobotSprite.ts` - Animated sprite manager
- `src/components/arena/pixi/assetLoader.ts` - PNG sequence loader

**To use:** Place PNG frame sequences in `/public/assets/sprites/{holobot}/{action}/`
- See `SPRITE_ANIMATION_SYSTEM.md` for full details
- See `GLB_TO_SPRITE_TODO.md` for converting GLB models to PNG frames

## ✅ What's Already Done

1. ✅ PixiJS v8 installed (`pixi.js@8.6.6`)
2. ✅ `BattleScene` class created with animation methods
3. ✅ `ArenaCanvas` React wrapper component ready
4. ✅ Integrated into `BattleArenaView`
5. ✅ **HolobotSprite system** for animated sprites
6. ✅ **Asset loader** for PNG frame sequences
7. ✅ Placeholder sprites rendering (with fallback)
8. ✅ Attack animations working
9. ✅ Screen shake implemented
10. ✅ Event system functional

## 🎮 Testing the New System

### 1. Run the Development Server

```bash
npm run dev
```

### 2. Navigate to Arena V2

Go to: `http://localhost:5173/app/arena-v2`

The battle screen will auto-initialize with test fighters.

### 3. Trigger Animations

**Keyboard Shortcuts:**
- `S` - Strike attack (triggers Pixi animation)
- `D` - Defend (blocks attack)
- `C` - Combo attack (triggers Pixi animation)
- `F` - Finisher (triggers Pixi animation, requires 100% special meter)

**What to observe:**
- Blue rectangle (player) slides forward
- Red rectangle (opponent) flashes white
- Screen shakes (intensity varies by attack type)
- Attacker returns to original position
- Console logs show animation events

## 📁 File Locations

```
src/components/arena/pixi/
├── types.ts              # TypeScript interfaces
├── BattleScene.ts        # PixiJS rendering logic
└── ArenaCanvas.tsx       # React wrapper

src/components/arena/
└── BattleArenaView.tsx   # Main battle screen (updated)
```

## 🎨 Adding Animated Sprites (NEW!)

### Option 1: PNG Frame Sequences (Recommended)

**Current:** Colored rectangles (cyan for player, red for opponent) as fallback

**To add animated sprites:**

1. **Prepare PNG frame sequences:**
```
public/assets/sprites/
└── shadow/
    ├── idle/
    │   ├── frame_0001.png  (256x256, transparent PNG)
    │   ├── frame_0002.png
    │   └── ... (8 frames total)
    ├── strike/
    │   ├── frame_0001.png
    │   └── ... (12 frames total)
    ├── block/
    │   └── ... (6 frames)
    ├── hit/
    │   └── ... (4 frames)
    └── ko/
        └── ... (10 frames)
```

2. **That's it!** The system automatically:
   - ✅ Detects frames at runtime
   - ✅ Loads them into `AnimatedSprite`
   - ✅ Plays idle loop continuously
   - ✅ Plays action animations on trigger
   - ✅ Falls back to colored rectangles if frames missing

3. **Adjust frame counts** (if different from defaults):

In `BattleScene.ts` line ~73:
```typescript
animations: {
  idle: { frameCount: 8, framePattern: 'frame_####.png' },
  strike: { frameCount: 12, framePattern: 'frame_####.png' },
  block: { frameCount: 6, framePattern: 'frame_####.png' },
  hit: { frameCount: 4, framePattern: 'frame_####.png' },
  ko: { frameCount: 10, framePattern: 'frame_####.png' },
}
```

### Option 2: Convert GLB to PNG Frames

**If you have GLB animation files:**

See `GLB_TO_SPRITE_TODO.md` for detailed instructions on:
- Using Blender to render frames
- Automated Node.js conversion script
- Online tools for GLB → PNG conversion

**Quick manual method (5 minutes):**
1. Open `ShadowStrike.glb` in Blender
2. Set orthographic camera to side view
3. Render animation as PNG sequence (256x256)
4. Rename to `frame_0001.png`, `frame_0002.png`, etc.
5. Copy to `/public/assets/sprites/shadow/strike/`
6. Refresh browser - animation loads automatically!

### Customization

**Change sprite scale:**
```typescript
// In BattleScene.ts line ~100
scale: 3.0, // Bigger sprites
scale: 2.0, // Smaller sprites
```

**Change animation speed:**
```typescript
// In HolobotSprite.ts line ~68-75
animSprite.animationSpeed = 0.1; // Slower idle
animSprite.animationSpeed = 0.5; // Faster actions
```

**Use different Holobot:**
```typescript
// In BattleScene.ts line ~73
holobotName: 'ace', // Change from 'shadow' to 'ace' or 'kuma'
```

## 🎬 Adding New Animations

### Example: Add a "Critical Hit" Animation

**1. Define the animation in `BattleScene.ts`:**

```typescript
async playCriticalHit(params: AttackAnimationParams): Promise<void> {
  if (this.isAnimating) return;
  this.isAnimating = true;
  
  const attacker = params.attackerId === 'player' ? this.playerSprite : this.opponentSprite;
  const defender = params.attackerId === 'player' ? this.opponentSprite : this.playerSprite;
  
  if (!attacker || !defender) {
    this.isAnimating = false;
    return;
  }
  
  const originalX = attacker.position.x;
  
  // Fast lunge
  await this.animateSprite(attacker, {
    x: originalX + (params.attackerId === 'player' ? 24 : -24),
    scale: 2.5,
  }, 100);
  
  // Multiple flashes
  for (let i = 0; i < 3; i++) {
    this.flashSprite(defender, 0xffff00, 50);
    await this.wait(60);
  }
  
  // Heavy screen shake
  this.screenShake({ intensity: 10, duration: 200 });
  
  // Return
  await this.animateSprite(attacker, { x: originalX, scale: 2 }, 150);
  
  this.isAnimating = false;
  this.emitEvent({ type: 'animationComplete', data: { critical: true } });
}
```

**2. Expose it in `ArenaCanvas.tsx`:**

```typescript
export interface ArenaCanvasHandle {
  // ... existing methods
  playCriticalHit: (params: AttackAnimationParams) => Promise<void>;
}

// In useImperativeHandle:
playCriticalHit: async (params: AttackAnimationParams) => {
  if (!sceneRef.current) return;
  await sceneRef.current.playCriticalHit(params);
},
```

**3. Use it in `BattleArenaView.tsx`:**

```typescript
const handleCardPlay = async (cardId: string) => {
  const card = currentBattle.player.hand.find(c => c.id === cardId);
  if (!card) return;
  
  playCard(cardId);
  
  // Check for critical hit
  const isCritical = Math.random() < 0.2; // 20% chance
  
  if (isCritical && arenaCanvasRef.current) {
    await arenaCanvasRef.current.playCriticalHit({
      attackerId: 'player',
      defenderId: 'opponent',
      damageAmount: card.baseDamage * 2,
      attackType: card.type,
    });
  } else {
    await arenaCanvasRef.current.playAttack({ ... });
  }
};
```

## 🔧 Customization Examples

### Change Canvas Size

```tsx
<ArenaCanvas
  ref={arenaCanvasRef}
  width={800}    // Larger canvas
  height={450}
  onAnimationEvent={handleAnimationEvent}
/>
```

### Adjust Animation Speed

In `BattleScene.ts`, change duration values:

```typescript
// Slower attack
await this.animateSprite(attacker, { x: originalX + slideDistance }, 400); // was 200

// Faster return
await this.animateSprite(attacker, { x: originalX }, 100); // was 200
```

### Change Screen Shake Intensity

In `BattleScene.ts` - `getShakeIntensity()`:

```typescript
private getShakeIntensity(attackType: string): number {
  switch (attackType) {
    case 'strike': return 4;    // was 2
    case 'combo': return 8;     // was 4
    case 'special': return 12;  // was 6
    case 'finisher': return 16; // was 8
    default: return 2;
  }
}
```

### Add Background Image

In `BattleScene.ts` - `createBackground()`:

```typescript
createBackground(): void {
  const bgTexture = PIXI.Assets.get('background');
  if (bgTexture) {
    this.backgroundSprite = new PIXI.Sprite(bgTexture);
    this.backgroundSprite.width = this.INTERNAL_WIDTH;
    this.backgroundSprite.height = this.INTERNAL_HEIGHT;
    this.container.addChild(this.backgroundSprite);
  } else {
    // Fallback gradient (existing code)
  }
}
```

## 🐛 Troubleshooting

### Issue: Sprites not visible

**Solution:** Check browser console for errors. Verify sprite files exist in `/public/sprites/`.

```typescript
// Add debug logging in createFighters()
console.log('[BattleScene] Player sprite created:', this.playerSprite);
console.log('[BattleScene] Position:', this.playerSprite.position);
```

### Issue: Animations not triggering

**Solution:** Check that `arenaCanvasRef.current` exists before calling methods.

```typescript
if (!arenaCanvasRef.current) {
  console.error('ArenaCanvas ref not ready');
  return;
}
```

### Issue: Blurry sprites

**Solution:** Ensure pixel-perfect rendering is enabled.

In `BattleScene.ts`:
```typescript
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
```

In CSS (already applied):
```css
image-rendering: pixelated;
```

### Issue: Console errors about PIXI

**Solution:** Clear npm cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance Tips

### 1. Limit Simultaneous Animations

Only one animation at a time (already implemented via `isAnimating` flag).

### 2. Reuse Textures

Don't create new textures for each sprite:

```typescript
// Good
const texture = PIXI.Assets.get('player-idle');
const sprite1 = new PIXI.Sprite(texture);
const sprite2 = new PIXI.Sprite(texture); // Reuses same texture

// Bad
const sprite1 = new PIXI.Sprite(PIXI.Texture.from('player-idle.png'));
const sprite2 = new PIXI.Sprite(PIXI.Texture.from('player-idle.png')); // Loads twice
```

### 3. Destroy Unused Sprites

```typescript
if (this.oldSprite) {
  this.oldSprite.destroy({ texture: false }); // Keep texture for reuse
}
```

## 🎯 Next Steps

### 1. Add Real Sprites (Priority)
- Create or source 32x40px pixel art Holobot sprites
- Replace placeholder rectangles
- Test with actual artwork

### 2. Add Hit Effects
- Create hit impact sprite
- Add particle system for dramatic effects
- Implement damage numbers

### 3. Add Sound Effects
- Hook up sound playback to animation events
- Add impact sounds, whoosh sounds
- Background battle music

### 4. Multi-Frame Animations
- Create sprite sheets for idle, attack, hit animations
- Use `PIXI.AnimatedSprite` for smooth animation
- Add state-based sprite switching

### 5. Special Move Cutscenes
- Implement camera zoom
- Full-screen flash effects
- Pause game state during cutscene

## 📚 Resources

- **PixiJS Documentation**: https://pixijs.com/8.x/guides
- **PixiJS Examples**: https://pixijs.com/8.x/examples
- **Pixi DevTools**: Install "Pixi.js devtools" Chrome extension
- **Architecture Doc**: See `PIXI_BATTLE_ARCHITECTURE.md` for full details

## 🆘 Getting Help

**Console Logs:**
- `[BattleScene]` prefix for Pixi-related logs
- `[ArenaCanvas]` prefix for React wrapper logs
- `[BattleArenaView]` prefix for animation events

**Debug Mode:**
Add to `BattleScene.ts` constructor (dev only):
```typescript
if (import.meta.env.DEV) {
  (window as any).__PIXI_APP__ = this.app;
  console.log('[BattleScene] Debug mode enabled');
}
```

Then in browser console:
```javascript
__PIXI_APP__.stage.children // View scene graph
```

---

**Ready to battle!** 🎮⚔️

The system is live and functional. Navigate to `/app/arena-v2` and press `S` to see your first Pixi-powered attack animation!
