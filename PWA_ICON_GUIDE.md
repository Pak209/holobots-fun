# 🎨 PWA Icon Generation Guide

Quick guide to generate the required PWA icons for Holobots.

---

## 📋 Required Icons

```
public/
├── icon-192.png     # 192x192px (Required for Android)
├── icon-512.png     # 512x512px (Required for splash screen)
└── favicon.ico      # Already exists ✅
```

---

## 🚀 Quick Method (CLI)

### Option 1: PWA Asset Generator (Fastest)

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate from existing image
pwa-asset-generator public/og-image.png public/ \
  --icon-only \
  --favicon \
  --type png \
  --padding "calc(100% * 0.1)" \
  --background "#F5C400"

# This creates:
# - icon-192.png
# - icon-512.png
# - favicon.ico (updated)
```

### Option 2: ImageMagick

```bash
# Install ImageMagick first
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Generate icons
convert public/og-image.png -resize 192x192 public/icon-192.png
convert public/og-image.png -resize 512x512 public/icon-512.png
```

---

## 🌐 Online Tools

### PWA Builder (Recommended)
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your logo (min 512x512px)
3. Customize padding and background
4. Download zip
5. Extract to `public/` folder

### Favicon.io
1. Visit: https://favicon.io/
2. Upload image or use text generator
3. Download package
4. Rename files to match requirements
5. Place in `public/` folder

### RealFaviconGenerator
1. Visit: https://realfavicongenerator.net/
2. Upload master image
3. Configure for all platforms
4. Download package
5. Extract to `public/` folder

---

## 🎨 Design Guidelines

### Icon Requirements

**Size:**
- Minimum: 192x192px
- Recommended: 512x512px (for splash screens)
- Format: PNG with transparency

**Design:**
- Square canvas (1:1 aspect ratio)
- 10-15% padding around icon
- Transparent or solid background
- Simple, recognizable at small sizes

**Colors:**
- Primary: #F5C400 (Holobots gold)
- Background: Transparent or #000000
- Ensure good contrast

### Bad Examples ❌
- Text-heavy logos (unreadable at small sizes)
- Complex gradients (pixelates)
- Thin lines (disappear at small sizes)
- Off-center content (looks awkward)

### Good Examples ✅
- Simple Holobot silhouette
- Bold "H" letter mark
- Recognizable symbol
- Centered, balanced composition

---

## 🖼️ Using Existing Assets

If you have a Holobot logo:

```bash
# Assuming you have holobot-logo.png
convert holobot-logo.png \
  -resize 192x192 \
  -gravity center \
  -background transparent \
  -extent 192x192 \
  public/icon-192.png

convert holobot-logo.png \
  -resize 512x512 \
  -gravity center \
  -background transparent \
  -extent 512x512 \
  public/icon-512.png
```

---

## 🧪 Testing Icons

### Preview Locally

```bash
# Build the app
npm run build

# Preview
npm run preview

# Open DevTools → Application → Manifest
# Check "Icons" section
```

### Test on Device

**Android:**
1. Install PWA on device
2. Icon appears on home screen
3. Check if it looks good at various sizes

**iOS:**
1. Add to Home Screen in Safari
2. Icon appears on home screen
3. Verify it looks crisp

---

## 📐 Icon Specifications by Platform

### Android
- **Launcher Icon**: 192x192px (mdpi)
- **Adaptive Icon**: 512x512px (safe zone in center 60%)
- **Notification Icon**: Use maskable version
- **Format**: PNG with transparency

### iOS
- **Home Screen**: 180x180px (retina)
- **Spotlight**: 120x120px
- **Settings**: 87x87px
- **Format**: PNG, no transparency (use white/colored bg)

### Desktop (Windows/macOS)
- **Taskbar/Dock**: 256x256px
- **High DPI**: 512x512px
- **Format**: PNG with transparency

---

## 🎯 Maskable Icons (Advanced)

Maskable icons adapt to different device styles:

```bash
# Create maskable version with safe zone
pwa-asset-generator source.png public/ \
  --maskable \
  --padding "calc(100% * 0.2)" \
  --background "#F5C400"
```

**Safe Zone:**
- Center 60% contains critical content
- Outer 40% can be clipped by system
- Test at: https://maskable.app/

---

## 🔧 Troubleshooting

### Icon not showing after install
- Clear browser cache
- Uninstall and reinstall PWA
- Check file paths in manifest
- Verify icons are in `public/` folder

### Icon looks pixelated
- Use larger source image (min 1024x1024)
- Export at 2x resolution
- Use lossless PNG compression

### Icon has white border on dark mode
- Use transparent background
- Or provide separate dark mode icon
- Test on both light and dark themes

---

## 📱 Quick Test Checklist

- [ ] icon-192.png exists in public/
- [ ] icon-512.png exists in public/
- [ ] Icons are square (1:1 ratio)
- [ ] Icons have transparent background (or themed)
- [ ] Icons look good at small size
- [ ] Icons are centered on canvas
- [ ] Run `npm run build` successfully
- [ ] Check DevTools → Application → Manifest
- [ ] Test install on mobile device
- [ ] Verify icon on home screen

---

## 💡 Pro Tips

1. **Start with high resolution** (1024x1024 or larger)
2. **Test on real devices** (screenshots aren't enough)
3. **Keep it simple** (details get lost at small sizes)
4. **Use brand colors** (#F5C400 for Holobots)
5. **Provide padding** (10-15% around edge)
6. **Consider dark mode** (test on both themes)

---

## 🎨 Temporary Icon (For Testing)

If you need to test quickly without a proper icon:

```bash
# Create simple text-based icon using ImageMagick
convert -size 512x512 xc:#F5C400 \
  -gravity center \
  -pointsize 256 \
  -fill black \
  -annotate +0+0 "H" \
  public/icon-512.png

convert public/icon-512.png -resize 192x192 public/icon-192.png
```

---

**Once you have your icons, rebuild the app and test the install prompt!**

```bash
npm run build
npm run preview
```
