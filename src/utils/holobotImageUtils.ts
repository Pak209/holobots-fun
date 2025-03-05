
// Central source of truth for holobot image mappings
export const HOLOBOT_IMAGE_MAPPING: Record<string, string> = {
  "ACE": "/lovable-uploads/ace.png",
  "KUMA": "/lovable-uploads/kuma.png",
  "SHADOW": "/lovable-uploads/shadow.png",
  "ERA": "/lovable-uploads/era.png",
  "HARE": "/lovable-uploads/hare.png",
  "TORA": "/lovable-uploads/tora.png",
  "WAKE": "/lovable-uploads/wake.png",
  "GAMA": "/lovable-uploads/gama.png",
  "KEN": "/lovable-uploads/ken.png",
  "KURAI": "/lovable-uploads/kurai.png",
  "TSUIN": "/lovable-uploads/tsuin.png",
  "WOLF": "/lovable-uploads/wolf.png"
};

// Create normalized mapping that includes all possible variations
const NORMALIZED_HOLOBOT_MAPPING: Record<string, string> = {};

// Initialize the normalized mapping
Object.entries(HOLOBOT_IMAGE_MAPPING).forEach(([key, value]) => {
  // Store uppercase version (original)
  NORMALIZED_HOLOBOT_MAPPING[key] = value;
  
  // Store lowercase version
  NORMALIZED_HOLOBOT_MAPPING[key.toLowerCase()] = value;
  
  // Store capitalized version (first letter uppercase, rest lowercase)
  NORMALIZED_HOLOBOT_MAPPING[
    key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
  ] = value;
});

export const getHolobotImagePath = (key: string | undefined): string => {
  if (!key) {
    console.error("Missing holobot key");
    return "/placeholder.svg";
  }

  // Clean up and normalize the key
  const cleanKey = key.trim();
  console.log(`Getting image path for holobot: "${cleanKey}"`);
  
  // Try exact match first in normalized mapping
  if (NORMALIZED_HOLOBOT_MAPPING[cleanKey]) {
    console.log(`Found exact match for ${cleanKey}: ${NORMALIZED_HOLOBOT_MAPPING[cleanKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[cleanKey];
  }
  
  // Try uppercase match in original mapping
  const upperKey = cleanKey.toUpperCase();
  if (HOLOBOT_IMAGE_MAPPING[upperKey]) {
    console.log(`Found uppercase match for ${cleanKey}: ${HOLOBOT_IMAGE_MAPPING[upperKey]}`);
    return HOLOBOT_IMAGE_MAPPING[upperKey];
  }
  
  // If still no match, check the key format more aggressively
  // First check if it's a filename without extension
  if (cleanKey.indexOf('.') === -1) {
    // Check if it's a part of a known holobot name
    for (const [botName, path] of Object.entries(HOLOBOT_IMAGE_MAPPING)) {
      if (botName.toLowerCase().includes(cleanKey.toLowerCase()) || 
          cleanKey.toLowerCase().includes(botName.toLowerCase())) {
        console.log(`Found partial match: ${botName} for input ${cleanKey}, using: ${path}`);
        return path;
      }
    }
  }
  
  // Last resort: create the path directly based on lowercase name
  const directPath = `/lovable-uploads/${cleanKey.toLowerCase()}.png`;
  console.log(`Using direct path for ${cleanKey}: ${directPath}`);
  return directPath;
};
