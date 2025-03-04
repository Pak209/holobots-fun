
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
  
  // Store capitalized version
  NORMALIZED_HOLOBOT_MAPPING[
    key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
  ] = value;
});

export const getHolobotImagePath = (key: string | undefined): string => {
  if (!key) {
    console.error("Missing holobot key");
    return "/placeholder.svg";
  }

  const cleanKey = key.trim();
  console.log(`Looking up image for holobot: "${cleanKey}"`);

  // Try exact match first
  if (NORMALIZED_HOLOBOT_MAPPING[cleanKey]) {
    console.log(`Found exact match for "${cleanKey}"`);
    return NORMALIZED_HOLOBOT_MAPPING[cleanKey];
  }

  // Try uppercase
  const upperKey = cleanKey.toUpperCase();
  if (NORMALIZED_HOLOBOT_MAPPING[upperKey]) {
    console.log(`Found uppercase match for "${upperKey}"`);
    return NORMALIZED_HOLOBOT_MAPPING[upperKey];
  }

  // Try lowercase
  const lowerKey = cleanKey.toLowerCase();
  if (NORMALIZED_HOLOBOT_MAPPING[lowerKey]) {
    console.log(`Found lowercase match for "${lowerKey}"`);
    return NORMALIZED_HOLOBOT_MAPPING[lowerKey];
  }

  console.error(`No image found for holobot: "${cleanKey}"`, {
    availableKeys: Object.keys(NORMALIZED_HOLOBOT_MAPPING).join(", ")
  });
  return "/placeholder.svg";
};

