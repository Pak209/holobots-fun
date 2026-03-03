# Pixel Battle Sprite Guide

## 🎨 Current Sprite Implementation

The current `PixelBattleAnimation` component uses CSS-based placeholder sprites built with div elements. This provides a foundation that can be easily replaced with actual pixel art.

## 📐 Sprite Specifications

### Holobot Sprite Dimensions
- **Base Size**: 24x32 to 32x40 pixels (scaled up 2-4x for display)
- **Display Size**: 96px - 128px width, 128px - 160px height
- **Format**: PNG with transparency
- **Style**: Pixel art with imageRendering: 'pixelated'

### Sprite Components (Current Placeholder)

#### Player Holobot (Blue/Cyan)
```
┌─────────────┐
│    HEAD     │  12x12px - Cyan with visor
│  ╔═══════╗  │
│  ║ ●   ● ║  │  Eyes (2px black dots)
│  ║───────║  │  Visor (1px yellow line)
│  ╚═══════╝  │
├─────────────┤
│    BODY     │  14x12px - Blue with core
│  ┌───────┐  │
│  │   ◆   │  │  Core (4x4px cyan diamond)
│  │       │  │
│  └───────┘  │
├─────────────┤
│ ARM │ │ ARM │  3x8px each - Cyan
├─────────────┤
│ LEG │ │ LEG │  4x6px each - Blue
└─────────────┘
```

#### Opponent Holobot (Red/Orange)
Same structure, different colors:
- Head: Red
- Body: Dark Red
- Arms: Red
- Legs: Dark Red
- Core: Orange (pulsing)

## 🎬 Animation States

### 1. Idle State
- Slight bobbing animation (optional)
- Pulsing core
- Static stance

### 2. Attack State
- Slide forward 8-16px
- Scale up to 110%
- Duration: 300ms
- Return to idle: 300ms

### 3. Hit State (Future)
- Flash white/red
- Knockback effect
- Shake animation

### 4. Defend State (Future)
- Shield icon overlay
- Blue glow effect
- Defensive posture

### 5. Special/Finisher State (Future)
- Charge-up effect (glow buildup)
- Flash effects
- Screen shake
- Large attack overlay

## 🖼️ Creating Real Pixel Sprites

### Option 1: Design Software
**Aseprite** (Recommended for pixel art)
1. Create new sprite: 32x40px
2. Design Holobot with layers:
   - Base outline
   - Body colors
   - Highlights/shadows
   - Details (eyes, core, etc.)
3. Export as PNG with transparency
4. Create animation frames if needed

**Photoshop/GIMP**
1. Set grid to 1px
2. Use pencil tool (no anti-aliasing)
3. Work at 32x40px
4. Export as PNG

### Option 2: AI Generation
Use tools like:
- **Midjourney**: "pixel art robot sprite, 32x32, transparent background, game character"
- **DALL-E**: "retro pixel art fighting robot, 8-bit style, sprite sheet"
- **Stable Diffusion**: With pixel art models

### Option 3: Convert Existing Art
1. Take existing Holobot artwork
2. Downscale to 32x40px
3. Apply posterize effect
4. Manually clean up pixels
5. Add pixel-art shading

## 📦 Sprite Sheet Structure (Future Implementation)

For more advanced animations, create a sprite sheet:

```
┌────────────────────────────────────────┐
│ idle1 │ idle2 │ idle3 │ idle4 │ idle5 │  Idle animation
├────────────────────────────────────────┤
│ atk1  │ atk2  │ atk3  │ atk4  │ atk5  │  Attack animation
├────────────────────────────────────────┤
│ hit1  │ hit2  │ hit3  │       │       │  Hit reaction
├────────────────────────────────────────┤
│ def1  │ def2  │ def3  │       │       │  Defense stance
├────────────────────────────────────────┤
│ spcl1 │ spcl2 │ spcl3 │ spcl4 │ spcl5 │  Special attack
└────────────────────────────────────────┘
```

Each frame: 32x40px
Total sheet size: 160x200px (5 cols x 5 rows)

## 🔄 Implementing Custom Sprites

### Replace CSS Sprites with Images

#### Current (CSS-based):
```typescript
<div className="w-24 h-32 bg-gradient-to-b from-cyan-500 to-blue-700">
  {/* CSS shapes */}
</div>
```

#### Updated (Image-based):
```typescript
<img 
  src="/sprites/player-holobot-idle.png"
  alt="Player Holobot"
  className="w-24 h-32 pixel-art"
  style={{
    imageRendering: 'pixelated',
    transform: animationState === 'playerAttack' ? 'translateX(16px) scale(1.1)' : 'none'
  }}
/>
```

### Add to Component
```typescript
// In PixelBattleAnimation.tsx
const spriteMap = {
  player: {
    idle: '/sprites/holobot-blue-idle.png',
    attack: '/sprites/holobot-blue-attack.png',
    hit: '/sprites/holobot-blue-hit.png',
    defend: '/sprites/holobot-blue-defend.png',
  },
  opponent: {
    idle: '/sprites/holobot-red-idle.png',
    attack: '/sprites/holobot-red-attack.png',
    hit: '/sprites/holobot-red-hit.png',
    defend: '/sprites/holobot-red-defend.png',
  }
};

const playerSprite = spriteMap.player[animationState === 'playerAttack' ? 'attack' : 'idle'];
```

## 🎨 Color Palettes

### Player (Blue Team)
```
- Primary:   #06B6D4 (Cyan-500)
- Secondary: #0284C7 (Sky-600)
- Dark:      #0C4A6E (Sky-900)
- Light:     #67E8F9 (Cyan-300)
- Core:      #FACC15 (Yellow-400)
```

### Opponent (Red Team)
```
- Primary:   #EF4444 (Red-500)
- Secondary: #DC2626 (Red-600)
- Dark:      #7F1D1D (Red-900)
- Light:     #FCA5A5 (Red-300)
- Core:      #FB923C (Orange-400)
```

### Effects
```
- Hit Flash:  #FFFFFF (White)
- Counter:    #06B6D4 (Cyan-500)
- Special:    #A855F7 (Purple-500)
- Gold:       #F5C400 (Custom Gold)
```

## 📁 File Organization

Recommended sprite storage:
```
public/
└── sprites/
    ├── holobots/
    │   ├── player/
    │   │   ├── idle.png
    │   │   ├── attack.png
    │   │   ├── hit.png
    │   │   ├── defend.png
    │   │   └── special.png
    │   └── opponent/
    │       ├── idle.png
    │       ├── attack.png
    │       ├── hit.png
    │       ├── defend.png
    │       └── special.png
    └── effects/
        ├── impact.png
        ├── flash.png
        └── particles.png
```

## 🎯 Sprite Animation Frame Rate

- Idle: 4-6 frames @ 200ms per frame (5 FPS)
- Attack: 5-8 frames @ 50-100ms per frame (10-20 FPS)
- Hit: 3-4 frames @ 80ms per frame (12 FPS)
- Special: 8-12 frames @ 60ms per frame (16 FPS)

## 🔧 CSS for Pixel-Perfect Rendering

```css
.pixel-art {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.pixel-sprite {
  /* Prevent anti-aliasing */
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: -webkit-optimize-contrast;
}
```

## 🚀 Quick Start: Using Reference Image

The uploaded reference image shows excellent pixel art battle style! To replicate:

1. **Character proportions**: Large heads (40% of height), compact bodies
2. **Visual hierarchy**: Top bars for HP/stats, large center for characters, bottom for cards
3. **Battle log**: Simple text-based log on left side
4. **Turn counter**: Large, prominent number on right
5. **Attack effects**: Simple geometric shapes (stars, diamonds) in bright colors

Key elements from reference:
- Pixel grid background
- Retro color palette
- Large, readable sprites
- Clean UI separation
- Battle log with color-coded actions

---

**Next Steps**:
1. Create or source pixel art sprites (32x40px recommended)
2. Replace CSS-based sprites in `PixelBattleAnimation.tsx`
3. Add sprite sheet for multi-frame animations (optional)
4. Test imageRendering: 'pixelated' for crisp display
5. Add more attack effect overlays

