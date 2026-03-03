# Meshy → Blender Bridge Setup

Fix: **"Failed to send model to blender. Please ensure blender is running and the bridge is enabled."**

## 1. Install the Meshy Blender Plugin

The plugin is **not** the same as Blender MCP. You must install the Meshy addon.

**Download (pick one):**
- Direct: **[meshy-blender-plugin-v0.5.5.zip](https://cdn.meshy.ai/meshy-for-blender/meshy-blender-plugin-v0.5.5.zip)**
- Or: [meshy.ai](https://www.meshy.ai) → top bar **Resources** → **Blender plugin** (starts download)

**Do not unzip the file.**

**In Blender 5.0:**
1. **Edit → Preferences → Add-ons**
2. Top-right **⋮** (three dots) → **Install from Disk…**
3. Select the downloaded **.zip** file → **Install from Disk**
4. Search for **"Meshy"** in the add-ons list
5. **Check the box** to enable the addon

You should see a **Meshy** panel on the **right** side of the 3D viewport (separate from Blender MCP).

## 2. Log in with your Meshy API key

- In the Meshy panel, find the **API key** / **Authentication** field.
- Get your key: [Meshy account](https://www.meshy.ai) → account/settings → API key ([docs](https://docs.meshy.ai/en/api/authentication)).
- Enter and save it in the plugin.

## 3. Turn the Bridge ON in Blender

- In the **Meshy** panel, find **Meshy Bridge** (often the first section).
- Click **Run Bridge**.
- The button should change to **Bridge ON** and stay highlighted.
- The bridge runs a **local server on port 5324** (ensure nothing else uses it; firewall usually allows localhost).

## 4. Send from Meshy to Blender

1. **Keep Blender open** with the bridge running (**Bridge ON**).
2. On [meshy.ai](https://www.meshy.ai), open your asset (e.g. Violet Colossus).
3. Use **Send to** (or **DCC Bridge**) → **Send to Blender**.
4. The model should download and import into your current Blender scene.

## Checklist

| Step | Done |
|------|------|
| Download meshy-blender-plugin zip (do not unzip) | ☐ |
| Blender: Edit → Preferences → Add-ons → Install from Disk → select zip | ☐ |
| Enable the "Meshy" addon (checkbox) | ☐ |
| Meshy panel visible on right side of viewport | ☐ |
| Enter Meshy API key in the plugin | ☐ |
| In Meshy panel: click **Run Bridge** → shows **Bridge ON** | ☐ |
| Blender stays open; try Send to Blender from meshy.ai | ☐ |

## Notes

- **Blender MCP** (Cursor ↔ Blender) and **Meshy plugin** (Meshy website ↔ Blender) are different. Both can be enabled.
- Meshy docs list Blender **4.2.6** as tested; **5.0** usually works. If the addon fails to load, check the addon’s error in Preferences → Add-ons.
- Bridge requires **Pro** or higher for “Send to Blender” from the webapp ([Bridge to Blender](https://docs.meshy.ai/en/blender-plugin/bridge-to-blender)).
