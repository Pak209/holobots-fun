# Mixamo Rig + Attack Animation Test (Kuma)

## Why Kuma isn’t ready yet

Your current **Kuma** in Blender is **mesh only**: no armature, no vertex groups.  
**Mixamo Rig** needs a **Mixamo-style skeleton** (armature from a Mixamo FBX). So we have to get a rigged character into the scene first.

---

## Option A – Test with a Mixamo character (fastest)

Use a stock Mixamo character + attack to confirm the addon works.

### 1. Get files from Mixamo

1. Go to [mixamo.com](https://www.mixamo.com) (free Adobe account).
2. **Character:** Pick a character (e.g. **Y Bot**), click **Download** → **FBX for Unity** (or **Generic**), **Without Skin** = off (so you get the character + rig). Download → e.g. `Y Bot.fbx`.
3. **Attack:** In **Animations**, pick an attack (e.g. **Kick**, **Punching**). Same character, **Download** → FBX, **Without Skin** = on (animation only). Download → e.g. `Kick.fbx`.

### 2. In Blender

1. **File → Import → FBX** → select the **character** FBX (e.g. `Y Bot.fbx`).
2. In the Outliner, select the **Armature** (often same name as the character).
3. **N** to open the sidebar → **Mixamo** tab → **Create Control Rig** (leave defaults) → confirm.
4. **File → Import → FBX** → select the **attack** FBX (e.g. `Kick.fbx`). A second armature appears (with the animation).
5. In the **Mixamo** panel, set **Source Armature** to the **newly imported** armature (the one that came with the attack).
6. Make sure the **control rig** (first armature) is the **active** object, then click **Apply Animation to Control Rig**.

You should see the character play the attack on the control rig. Then you can repeat with Kuma (Option B).

---

## Option B – Use Kuma with Mixamo

If Kuma is your own model (e.g. from Meshy):

1. Go to [mixamo.com](https://www.mixamo.com).
2. **Upload** your Kuma model (OBJ/FBX). Mixamo will **auto-rig** it.
3. Download the **rigged** Kuma as FBX (character with skin, no animation).
4. In Blender, **File → Import → FBX** → that Kuma FBX.
5. Select the Kuma **armature** → **Mixamo** panel → **Create Control Rig**.
6. In Mixamo, pick an **attack** for that character, **Download** as FBX (animation only).
7. In Blender, **Import** that attack FBX.
8. Set **Source Armature** to the attack’s armature, keep the Kuma control rig active → **Apply Animation to Control Rig**.

---

## Script helper (after you have an armature)

After you’ve imported a **single** Mixamo character FBX (one armature in the scene), you can run this in Blender’s **Scripting** workspace to create the control rig without using the UI:

```python
import bpy

# Select the Mixamo armature (first armature in scene)
arm = next((o for o in bpy.context.scene.objects if o.type == "ARMATURE"), None)
if not arm:
    raise Exception("No armature in scene. Import a Mixamo character FBX first.")

bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.mr.make_rig('INVOKE_DEFAULT')  # Opens dialog; confirm to create control rig
```

After you’ve created the control rig and then imported an **attack** FBX, set the source and apply animation:

```python
import bpy

# Armature that just came in with the attack (usually last imported)
source_armatures = [o for o in bpy.context.scene.objects if o.type == "ARMATURE"]
# Control rig has "mr_control_rig" on armature data
control_rig = next((a for a in source_armatures if hasattr(a.data, "keys") and "mr_control_rig" in a.data.keys()), None)
source_arm = next((a for a in source_armatures if a != control_rig), source_armatures[-1] if source_armatures else None)

bpy.context.scene.mix_source_armature = source_arm
bpy.ops.object.select_all(action='DESELECT')
control_rig.select_set(True)
bpy.context.view_layer.objects.active = control_rig
bpy.ops.mr.import_anim_to_rig()
```

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Get character FBX from Mixamo (with skin) |
| 2 | Blender: Import FBX → select armature |
| 3 | Mixamo panel → **Create Control Rig** |
| 4 | Get attack FBX from Mixamo (same character) |
| 5 | Blender: Import attack FBX |
| 6 | Set **Source Armature** = new armature, click **Apply Animation to Control Rig** |

Once you’ve imported a character FBX (or Kuma from Mixamo), say what you see in the Outliner (armature name) and we can wire the script or next steps exactly to your scene.
