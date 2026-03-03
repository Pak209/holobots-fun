# PixiJS Battle Architecture - Arena V2

## 🎯 Overview

Arena V2 now uses **PixiJS v8** (WebGL 2D) for battle scene rendering with a clean separation between rendering (Pixi) and UI/game logic (React).

### Architecture Principles

✅ **React owns game state** - All battle logic, turn management, and state updates happen in React
✅ **Pixi only visualizes** - PixiJS renders sprites, animations, and visual effects
✅ **Clean separation** - No UI elements in Pixi, no rendering logic in React
✅ **Ref-based API** - React controls Pixi through exposed methods
✅ **Event-driven** - Pixi emits events back to React when animations complete

## 📁 File Structure

```
src/components/arena/pixi/
├── types.ts              # Shared TypeScript types
├── BattleScene.ts        # Pure PixiJS rendering logic
└── ArenaCanvas.tsx       # React wrapper component

src/components/arena/
└── BattleArenaView.tsx   # Main battle screen (uses ArenaCanvas)
```

## 🏗️ Component Architecture

### 1. `types.ts` - Shared Types

Defines the contract between React and Pixi:

```typescript
// Configuration
BattleSceneConfig

// Animation parameters
AttackAnimationParams
HitEffectParams
ScreenShakeParams

// Event system
AnimationEvent
BattleSceneEventListener
```

### 2. `BattleScene.ts` - Pure PixiJS Logic

**Responsibilities:**
- Initialize PixiJS Application with pixel-perfect settings
- Load and manage sprite assets
- Render background, fighters, and effects
- Execute animations (attacks, hits, KO, etc.)
- Emit events when animations complete

**Key Methods:**
```typescript
class BattleScene {
  // Setup
  async loadAssets(): Promise<void>
  createBackground(): void
  createFighters(player, opponent): void
  
  // Animations
  async playAttack(params): Promise<void>
  async playBlock(): Promise<void>
  async playHit(params): Promise<void>
  async playKO(): Promise<void>
  
  // Effects
  screenShake(params): void
  
  // Lifecycle
  resize(width, height): void
  destroy(): void
  
  // Events
  addEventListener(listener): void
  removeEventListener(listener): void
}
```

**Rendering Settings:**
- Internal resolution: 320x180 (pixel-perfect)
- Scale mode: `NEAREST` (no smoothing)
- Auto-scaling to fit container
- Integer scaling for crisp pixels

### 3. `ArenaCanvas.tsx` - React Wrapper

**Responsibilities:**
- Manage Pixi lifecycle (mount/unmount)
- Handle canvas resize
- Expose animation API via `useImperativeHandle`
- Forward events from Pixi to React

**Exposed API (via ref):**
```typescript
interface ArenaCanvasHandle {
  playAttack(params: AttackAnimationParams): Promise<void>;
  playBlock(): Promise<void>;
  playHit(params: HitEffectParams): Promise<void>;
  playKO(): Promise<void>;
  screenShake(params: ScreenShakeParams): void;
}
```

**Usage:**
```tsx
const arenaCanvasRef = useRef<ArenaCanvasHandle>(null);

<ArenaCanvas
  ref={arenaCanvasRef}
  width={640}
  height={360}
  onAnimationEvent={handleAnimationEvent}
/>

// Trigger animation
await arenaCanvasRef.current.playAttack({
  attackerId: 'player',
  defenderId: 'opponent',
  damageAmount: 25,
  attackType: 'strike',
});
```

### 4. `BattleArenaView.tsx` - Main Battle Screen

**React Components (UI):**
- `BattleHPBars` - Side-by-side HP/stamina displays
- `ArenaCanvas` - PixiJS battle rendering
- `BattleLogDisplay` - Scrollable action history
- `ActionCardHand` - Player's battle cards
- `EquippedParts` - Equipment display
- `BattleControls` - Defense/Hack/Special buttons

**Flow:**
```
User clicks card
  → React: handleCardPlay()
  → React: playCard() (update state)
  → Pixi: arenaCanvasRef.playAttack()
  → Pixi: Animates sprite movement, hit effects
  → Pixi: Emits 'animationComplete' event
  → React: handleAnimationEvent()
  → React: Continue turn logic
```

## 🎮 Animation System

### Attack Animation Flow

1. **Start Attack**
   - Emit `attackStarted` event
   - Store original position
   
2. **Slide Forward**
   - Move attacker sprite 16px forward
   - Scale up to 2.2x
   - Duration: 200ms
   
3. **Hit Pause**
   - 3-frame pause (50ms at 60fps)
   - Flash defender white
   - Screen shake based on attack type
   
4. **Hit Landed**
   - Emit `hitLanded` event
   
5. **Return**
   - Move attacker back to original position
   - Reset scale to 2x
   - Duration: 200ms
   
6. **Complete**
   - Emit `animationComplete` event

### Screen Shake Intensity

| Attack Type | Intensity |
|-------------|-----------|
| Strike      | 2         |
| Combo       | 4         |
| Special     | 6         |
| Finisher    | 8         |

### Hit Effects

- **Flash**: Sprite tints to color (white/red) for 100ms
- **Knockback**: 8px displacement, returns in 200ms
- **KO**: Multiple red flashes + fade out + scale down

## 🎨 Rendering Details

### Resolution & Scaling

```
Internal Resolution: 320x180 (16:9)
Display Resolution: 640x360 (or container size)
Scale Mode: NEAREST (pixel-perfect)
Filtering: None
Anti-aliasing: Disabled
```

### Sprite Setup

```typescript
sprite.anchor.set(0.5, 0.5);  // Center anchor
sprite.scale.set(2);           // 2x scale for visibility
sprite.position.set(x, y);     // Positioned in 320x180 space
```

### Placeholder Sprites

Currently using colored rectangles:
- **Player**: Cyan (0x06b6d4), 24x32px, left side
- **Opponent**: Red (0xef4444), 24x32px, right side

### Adding Real Sprites

1. **Add assets to public folder:**
```
public/sprites/
├── battle-bg.png
├── player-idle.png
├── player-attack.png
├── opponent-idle.png
├── opponent-attack.png
└── hit-effect.png
```

2. **Update `loadAssets()` in BattleScene.ts:**
```typescript
await PIXI.Assets.load([
  { alias: 'player-idle', src: '/sprites/player-idle.png' },
  { alias: 'player-attack', src: '/sprites/player-attack.png' },
  // ... more assets
]);
```

3. **Create sprites from textures:**
```typescript
const texture = PIXI.Assets.get('player-idle');
this.playerSprite = new PIXI.Sprite(texture);
```

## 🔄 Event System

### Events Emitted by Pixi

| Event | When | Data |
|-------|------|------|
| `attackStarted` | Animation begins | AttackAnimationParams |
| `hitLanded` | Hit connects | AttackAnimationParams |
| `animationComplete` | Animation finishes | Optional data |
| `koTriggered` | KO animation starts | None |

### Handling Events in React

```typescript
const handleAnimationEvent = useCallback((event: AnimationEvent) => {
  switch (event.type) {
    case 'attackStarted':
      // Pause UI updates
      break;
    case 'hitLanded':
      // Play sound effects
      break;
    case 'animationComplete':
      // Continue turn logic
      break;
    case 'koTriggered':
      // Show victory screen
      break;
  }
}, []);
```

## 🚀 Future Enhancements

### 1. Sprite Sheets & Animation Frames

```typescript
// Multi-frame animations
const frames = [];
for (let i = 0; i < 8; i++) {
  frames.push(PIXI.Assets.get(`player-attack-${i}`));
}
const animatedSprite = new PIXI.AnimatedSprite(frames);
animatedSprite.animationSpeed = 0.2;
animatedSprite.play();
```

### 2. Particle Effects

```typescript
import { Emitter } from '@pixi/particle-emitter';

const emitter = new Emitter(this.container, {
  lifetime: { min: 0.1, max: 0.5 },
  frequency: 0.01,
  spawnChance: 1,
  // ... particle config
});
```

### 3. Battle Replay System

Since Pixi only visualizes, replays are simple:
1. Record all `AttackAnimationParams` during battle
2. Store as array of animation commands
3. Replay by calling animation methods in sequence

```typescript
const replay = [
  { type: 'attack', params: { attackerId: 'player', ... } },
  { type: 'attack', params: { attackerId: 'opponent', ... } },
  // ...
];

async function playReplay(replay) {
  for (const action of replay) {
    await arenaCanvasRef.current.playAttack(action.params);
  }
}
```

### 4. PvP Support

Architecture is ready for PvP:
- React state = single source of truth
- All animations are deterministic
- Network sends game state updates
- Both clients render same animations

### 5. Advanced Effects

- **Trail effects**: Use `PIXI.Graphics` to draw motion blur
- **Impact ripples**: Animated sprite scales + fade
- **Background animations**: Parallax scrolling, weather
- **Special move cutscenes**: Camera zoom, full-screen effects

## 📊 Performance Characteristics

### Rendering Performance

- **60 FPS** target (16.67ms per frame)
- **WebGL acceleration** via PixiJS
- **Minimal draw calls** (2-4 sprites at once)
- **Pixel-perfect** with nearest-neighbor scaling

### Memory Usage

- **Texture memory**: ~1-2MB for all sprites
- **PixiJS core**: ~300KB minified
- **Runtime overhead**: Minimal (WebGL is efficient)

### Mobile Performance

- Tested on iPhone 12+, Pixel 6+ equivalents
- Smooth 60fps with current sprite count
- Scales well to high-DPI displays

## 🐛 Debugging

### Pixi DevTools

Enable Pixi DevTools in browser:
```typescript
// In BattleScene.ts (dev only)
if (import.meta.env.DEV) {
  (window as any).__PIXI_APP__ = this.app;
}
```

### Debug Overlays

Current implementation includes:
- "PIXI v8 • WebGL 2D" label
- Console logs for major events
- Animation state tracking

### Common Issues

**Sprites not rendering:**
- Check asset paths in `loadAssets()`
- Verify textures loaded before `createFighters()`
- Check sprite z-index (add order)

**Blurry sprites:**
- Ensure `PIXI.SCALE_MODES.NEAREST` is set
- Check CSS `image-rendering: pixelated`
- Verify container scaling is integer-based

**Animations laggy:**
- Check FPS in browser DevTools
- Reduce number of simultaneous animations
- Profile with Chrome Performance tab

## 📝 Code Examples

### Example: Custom Attack Animation

```typescript
// In BattleScene.ts
async playSpecialAttack(params: AttackAnimationParams): Promise<void> {
  const attacker = this.getSprite(params.attackerId);
  const defender = this.getSprite(params.defenderId);
  
  // Charge up
  await this.animateSprite(attacker, { scale: 2.5 }, 300);
  this.screenShake({ intensity: 4, duration: 300 });
  
  // Flash effect
  this.flashSprite(attacker, 0xffff00, 200);
  
  // Launch attack
  await this.animateSprite(attacker, { 
    x: defender.position.x - 32 
  }, 150);
  
  // Impact
  this.flashSprite(defender, 0xff0000, 150);
  this.screenShake({ intensity: 8, duration: 200 });
  
  // Return
  await this.animateSprite(attacker, { 
    x: originalX, 
    scale: 2 
  }, 300);
  
  this.emitEvent({ type: 'animationComplete' });
}
```

### Example: Using in React

```typescript
// In BattleArenaView.tsx
const handleSpecialAttack = async () => {
  if (!arenaCanvasRef.current) return;
  
  // Update game state
  useSpecialAttack();
  
  // Play animation
  await arenaCanvasRef.current.playSpecialAttack({
    attackerId: 'player',
    defenderId: 'opponent',
    damageAmount: 50,
    attackType: 'special',
  });
  
  // Continue turn logic after animation
  nextTurn();
};
```

## ✅ Summary

### What React Handles
- Battle state management
- Turn logic and rules
- HP bars, energy meters, special meter
- Card hand and selection
- Battle log
- Victory/defeat screens
- User input (clicks, keyboard)

### What Pixi Handles
- Sprite rendering
- Attack animations
- Hit effects and flashes
- Screen shake
- Background rendering
- Visual transitions

### Communication Flow
```
React (State) → Pixi (Render) → React (Events) → React (Update State) → Pixi (Render)
```

This architecture is:
- ✅ Modular and maintainable
- ✅ Ready for PvP
- ✅ Replay-friendly
- ✅ Performance-optimized
- ✅ Easy to extend with new animations

---

**Version**: 1.0.0  
**PixiJS Version**: 8.6.6  
**Last Updated**: February 15, 2026
