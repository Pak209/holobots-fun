# GLB to Sprite Animation - Implementation Guide

## 🎯 Overview

This document outlines how to convert the 3D GLB animation files into 2D PNG sprite sequences for use in the PixiJS Arena V2 battle system.

## 📁 Available GLB Files

Located in `/src/assets/icons/glb/`:

### Ace Holobot
- `AceCombo.glb`
- `AceDefense.glb`
- `AceFinisher.glb`
- `AceStrike.glb`

### Kuma Holobot
- `KumaCombo.glb`
- `KumaDefense.glb`
- `KumaFinisher.glb`
- `KumaStrike.glb`

### Shadow Holobot
- `ShadowCombo.glb`
- `ShadowDefense.glb`
- `ShadowFinisher.glb`
- `ShadowStrike.glb`

## 🎬 Current Animation System (Already Implemented!)

### ✅ What's Working Now

The PixiJS battle system is **already set up** to load and play PNG frame sequences:

1. **`HolobotSprite.ts`** - Manages animated sprites with idle loops and action clips
2. **`assetLoader.ts`** - Loads PNG frame sequences into AnimatedSprite textures
3. **`BattleScene.ts`** - Uses HolobotSprite instances with fallback placeholders
4. **`ArenaCanvas.tsx`** - React wrapper (unchanged)

### Expected Directory Structure

```
public/assets/sprites/
├── shadow/
│   ├── idle/
│   │   ├── frame_0001.png
│   │   ├── frame_0002.png
│   │   └── ... (8 frames)
│   ├── strike/
│   │   ├── frame_0001.png
│   │   └── ... (12 frames)
│   ├── block/
│   │   └── ... (6 frames)
│   ├── hit/
│   │   └── ... (4 frames)
│   └── ko/
│       └── ... (10 frames)
├── ace/
│   └── ... (same structure)
└── kuma/
    └── ... (same structure)
```

### Frame Counts (Configurable in BattleScene.ts)

Current defaults:
- **idle**: 8 frames
- **strike**: 12 frames
- **block**: 6 frames
- **hit**: 4 frames
- **ko**: 10 frames

## 🛠️ Option 1: Manual Conversion (Quick Start)

### Using Blender (Free, Manual)

1. **Install Blender**: https://www.blender.org/download/

2. **Import GLB**:
   - File > Import > glTF 2.0 (.glb)
   - Select `ShadowStrike.glb`

3. **Set Up Camera**:
   - Switch to camera view (Numpad 0)
   - Position orthographic camera for side view
   - Adjust framing to show full character

4. **Render Animation Frames**:
   - Set output to PNG with transparency
   - Set resolution: 256x256px
   - Output folder: `/tmp/shadow_strike/`
   - Render > Render Animation

5. **Rename Frames**:
   ```bash
   cd /tmp/shadow_strike/
   for i in *.png; do
     num=$(echo $i | sed 's/[^0-9]//g')
     mv $i frame_$(printf "%04d" $num).png
   done
   ```

6. **Move to Project**:
   ```bash
   mkdir -p public/assets/sprites/shadow/strike
   cp frame_*.png public/assets/sprites/shadow/strike/
   ```

7. **Repeat for Other Animations** (idle, block, hit, ko)

## 🤖 Option 2: Automated Script (Recommended)

### Required Packages

```bash
npm install --save-dev three @types/three canvas gl
```

### Script: `/scripts/glb-to-sprites.ts`

```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Canvas, createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

interface ConversionConfig {
  inputPath: string;
  outputPath: string;
  holobotName: string;
  animationName: string;
  frameCount: number;
  width: number;
  height: number;
  cameraDistance: number;
  cameraAngle: { x: number; y: number; z: number };
}

async function convertGLBToSprites(config: ConversionConfig): Promise<void> {
  console.log(`Converting ${config.inputPath}...`);
  
  // Create Three.js scene
  const scene = new THREE.Scene();
  scene.background = null; // Transparent
  
  // Create orthographic camera
  const aspect = config.width / config.height;
  const frustumSize = 2;
  const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect,
    frustumSize * aspect,
    frustumSize,
    -frustumSize,
    0.1,
    1000
  );
  
  camera.position.set(
    config.cameraAngle.x,
    config.cameraAngle.y,
    config.cameraDistance
  );
  camera.lookAt(0, 0, 0);
  
  // Create renderer (headless)
  const canvas = createCanvas(config.width, config.height);
  const gl = canvas.getContext('webgl2');
  
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as any,
    context: gl as any,
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(config.width, config.height);
  renderer.setClearColor(0x000000, 0); // Transparent
  
  // Load GLB model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(config.inputPath);
  
  scene.add(gltf.scene);
  
  // Get animation clip
  const clip = gltf.animations[0]; // Assume first animation
  if (!clip) {
    console.error('No animation found in GLB');
    return;
  }
  
  // Create animation mixer
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(clip);
  action.play();
  
  // Ensure output directory exists
  const outputDir = path.join(config.outputPath, config.holobotName, config.animationName);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Render frames
  const duration = clip.duration;
  const frameDuration = duration / config.frameCount;
  
  for (let i = 0; i < config.frameCount; i++) {
    const time = i * frameDuration;
    mixer.setTime(time);
    
    // Render
    renderer.render(scene, camera);
    
    // Save frame
    const frameNum = String(i + 1).padStart(4, '0');
    const filename = `frame_${frameNum}.png`;
    const filepath = path.join(outputDir, filename);
    
    // Get canvas data and write to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`Rendered frame ${i + 1}/${config.frameCount}: ${filename}`);
  }
  
  console.log(`✅ Conversion complete: ${outputDir}`);
}

// Example usage
const configs: ConversionConfig[] = [
  {
    inputPath: './src/assets/icons/glb/ShadowStrike.glb',
    outputPath: './public/assets/sprites',
    holobotName: 'shadow',
    animationName: 'strike',
    frameCount: 12,
    width: 256,
    height: 256,
    cameraDistance: 5,
    cameraAngle: { x: 0, y: 1, z: 5 },
  },
  {
    inputPath: './src/assets/icons/glb/ShadowDefense.glb',
    outputPath: './public/assets/sprites',
    holobotName: 'shadow',
    animationName: 'block',
    frameCount: 6,
    width: 256,
    height: 256,
    cameraDistance: 5,
    cameraAngle: { x: 0, y: 1, z: 5 },
  },
  // Add more configs for other animations
];

// Run conversions
async function main() {
  for (const config of configs) {
    await convertGLBToSprites(config);
  }
}

main().catch(console.error);
```

### Add to package.json

```json
{
  "scripts": {
    "sprites:shadow": "ts-node scripts/glb-to-sprites.ts shadow",
    "sprites:ace": "ts-node scripts/glb-to-sprites.ts ace",
    "sprites:kuma": "ts-node scripts/glb-to-sprites.ts kuma",
    "sprites:all": "npm run sprites:shadow && npm run sprites:ace && npm run sprites:kuma"
  }
}
```

## 🎨 Option 3: Online Tools (Easiest)

### Using PlayCanvas or Similar

1. **Upload GLB** to https://playcanvas.com/ (free account)
2. **Set up orthographic camera** with side view
3. **Play animation** and use screen capture tools
4. **Extract frames** from video using FFmpeg:

```bash
ffmpeg -i shadow_strike.mp4 -vf "fps=12,scale=256:256" frame_%04d.png
```

### Using Blender with Python Script

Automate Blender rendering with a Python script:

```python
import bpy

# Load GLB
bpy.ops.import_scene.gltf(filepath="ShadowStrike.glb")

# Set up camera
camera = bpy.data.objects['Camera']
camera.data.type = 'ORTHO'
camera.location = (0, -5, 1)
camera.rotation_euler = (1.5708, 0, 0)

# Set render settings
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = '/tmp/frames/frame_'

# Render animation frames
for frame in range(1, 13):
    bpy.context.scene.frame_set(frame)
    bpy.context.scene.render.filepath = f'/tmp/frames/frame_{frame:04d}.png'
    bpy.ops.render.render(write_still=True)
```

## 🧪 Testing Without Real Sprites

The system **already works with fallback placeholders**!

### Current Behavior:
- ✅ If PNG sequences exist → Loads and plays them
- ✅ If PNG sequences missing → Uses colored rectangles as fallback
- ✅ Idle animation loops automatically
- ✅ Action animations play once then return to idle

### Test Now:
1. Navigate to `/app/arena-v2`
2. See cyan and red rectangles (fallbacks) with idle animation
3. Press `S` - triggers strike animation
4. See the sprite play the action and return to idle

## 📝 Implementation Checklist

### ✅ Already Complete
- [x] HolobotSprite class for managing animations
- [x] Asset loader for PNG frame sequences
- [x] BattleScene updated to use HolobotSprite
- [x] Fallback placeholders working
- [x] Action animation triggers (strike, block, hit, ko)
- [x] Idle loop working
- [x] Animation complete callbacks
- [x] Screen shake and effects maintained

### 🔜 To Do: Generate Sprite Frames

**Option A: Manual (Fastest)**
1. Open GLB in Blender
2. Set up camera
3. Render animation frames
4. Rename and organize files
5. Place in `/public/assets/sprites/{holobot}/{action}/`

**Option B: Automated Script**
1. Install dependencies: `npm install -D @gltf-transform/core canvas gl`
2. Create `/scripts/glb-to-sprites.ts` (see template above)
3. Add npm scripts to package.json
4. Run: `npm run sprites:shadow`

**Option C: Use Existing Tools**
1. Upload to online 3D viewer
2. Screen record animations
3. Extract frames with FFmpeg
4. Process and organize

### 🔜 To Do: Polish

Once sprites exist:
1. Adjust frame counts in `BattleScene.ts` to match actual frames
2. Tune animation speeds (`animationSpeed` in HolobotSprite)
3. Add more Holobots (Ace, Kuma) by updating the holobot name in config
4. Add sprite sheet optimization (optional, for performance)

## 🚀 Quick Win: Test with One Animation

**Minimum Viable Test:**

1. **Pick ONE animation**: `ShadowStrike.glb`
2. **Render 12 frames manually** in Blender (5 minutes)
3. **Save as**: `/public/assets/sprites/shadow/strike/frame_0001.png` ... `frame_0012.png`
4. **Refresh browser** - Strike animation will automatically load!

The system will:
- ✅ Detect the frames exist
- ✅ Load them into AnimatedSprite
- ✅ Play when you press `S` key
- ✅ Return to idle (placeholder) when done

## 📊 Performance Notes

### PNG Sequences vs Sprite Sheets

**Current: Individual PNGs**
- ✅ Easy to generate and test
- ✅ No atlas packing required
- ✅ Good for development
- ⚠️ Many network requests (use with HTTP/2)

**Future: Sprite Sheet Atlas**
- ✅ One image file per Holobot
- ✅ Fewer network requests
- ✅ Better production performance
- ⚠️ Requires packing tool (TexturePacker, Shoebox)

For now, individual PNGs work great!

## 🔧 Configuration

### Where to Adjust Settings

**Frame Counts** - In `BattleScene.ts`:
```typescript
animations: {
  idle: { frameCount: 8, framePattern: 'frame_####.png' },
  strike: { frameCount: 12, framePattern: 'frame_####.png' },
  // Adjust these to match your actual frame counts
}
```

**Animation Speed** - In `HolobotSprite.ts`:
```typescript
animSprite.animationSpeed = 0.15; // Idle: slower
animSprite.animationSpeed = 0.3;  // Actions: faster
```

**Sprite Scale** - In `BattleScene.ts`:
```typescript
scale: 2.5, // Increase/decrease to fit arena
```

**Camera Position** (for GLB conversion):
```typescript
cameraDistance: 5,
cameraAngle: { x: 0, y: 1, z: 5 }, // Slightly from above
```

## 📋 Action Mapping

| GLB File | Animation Name | Trigger |
|----------|----------------|---------|
| `ShadowStrike.glb` | `strike` | Press `S` key or click Strike card |
| `ShadowDefense.glb` | `block` | Press `D` key or click Defend card |
| `ShadowCombo.glb` | `strike` (reuse) | Press `C` key or click Combo card |
| `ShadowFinisher.glb` | `strike` (enhanced) | Press `F` key or click Finisher card |

**Note:** Combo and Finisher can share the strike animation for now, with different effects (screen shake intensity, etc.)

## 🎯 Recommended Next Steps

### Phase 1: Proof of Concept (30 minutes)
1. Pick Shadow Strike only
2. Manually render 12 frames in Blender
3. Save to `/public/assets/sprites/shadow/strike/`
4. Test in browser - strike animation should work!

### Phase 2: Complete One Holobot (2-3 hours)
1. Render all Shadow animations (idle, strike, block, hit, ko)
2. Organize into proper folders
3. Test all actions in Arena V2

### Phase 3: Automate (4-6 hours)
1. Create Node.js conversion script
2. Add npm run commands
3. Process all GLB files automatically
4. Generate consistent output

### Phase 4: All Holobots (Repeat Phase 2)
1. Process Ace GLB files
2. Process Kuma GLB files
3. Add Holobot selection in battle config

## 🐛 Troubleshooting

### Issue: Sprites not loading

**Check:**
1. Console logs show: `[AssetLoader] Loaded X/Y frames`
2. File paths are correct: `/public/assets/sprites/shadow/strike/frame_0001.png`
3. Frame numbers match (0001, 0002, not 1, 2)

### Issue: Animation too fast/slow

**Fix:** Adjust `animationSpeed` in `HolobotSprite.ts`:
```typescript
animSprite.animationSpeed = 0.2; // Slower
animSprite.animationSpeed = 0.5; // Faster
```

### Issue: Sprite too big/small

**Fix:** Adjust scale in `BattleScene.ts`:
```typescript
scale: 3.0, // Bigger
scale: 2.0, // Smaller
```

### Issue: Animation doesn't loop

**Fix:** Check loop setting in `HolobotSprite.ts`:
```typescript
animSprite.loop = true; // For idle
animSprite.loop = false; // For actions
```

## 📚 Resources

### Tools
- **Blender**: https://www.blender.org/
- **Three.js**: https://threejs.org/
- **TexturePacker**: https://www.codeandweb.com/texturepacker
- **FFmpeg**: https://ffmpeg.org/

### Documentation
- **GLB Format**: https://github.com/KhronosGroup/glTF
- **PixiJS AnimatedSprite**: https://pixijs.com/8.x/examples/sprite/animated-sprite
- **Three.js GLTFLoader**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader

### Similar Projects
- Search: "GLB to sprite sheet" on GitHub
- Search: "Three.js headless rendering node"
- Search: "convert 3D animation to 2D sprites"

## ✅ Summary

**What's ready NOW:**
- ✅ Pixi system loads PNG sequences automatically
- ✅ HolobotSprite manages animations
- ✅ Fallback placeholders work
- ✅ All wiring is complete

**What you need to do:**
- 🎨 Generate PNG frames from GLB files (manual or automated)
- 📁 Organize frames in correct folder structure
- 🧪 Test and adjust frame counts/speeds

**No code changes needed** once PNG files exist - the system will automatically detect and use them!

---

**Status**: 🟢 Ready for sprite generation
**Priority**: Start with Shadow Strike (one animation) as proof of concept
**Timeline**: 30 min manual / 4-6 hours automated
