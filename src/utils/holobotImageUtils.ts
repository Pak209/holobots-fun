
// Central source of truth for holobot image mappings
export const HOLOBOT_IMAGE_MAPPING: Record<string, string> = {
  "ace": "/lovable-uploads/ace.png",
  "kuma": "/lovable-uploads/kuma.png",
  "shadow": "/lovable-uploads/shadow.png",
  "era": "/lovable-uploads/era.png",
  "hare": "/lovable-uploads/hare.png",
  "tora": "/lovable-uploads/tora.png",
  "wake": "/lovable-uploads/wake.png",
  "gama": "/lovable-uploads/gama.png",
  "ken": "/lovable-uploads/ken.png",
  "kurai": "/lovable-uploads/kurai.png",
  "tsuin": "/lovable-uploads/tsuin.png",
  "wolf": "/lovable-uploads/wolf.png"
};

// Create a more comprehensive normalized mapping that includes all possible variations
const NORMALIZED_HOLOBOT_MAPPING: Record<string, string> = {};

// Initialize the normalized mapping with all possible case variations
Object.entries(HOLOBOT_IMAGE_MAPPING).forEach(([key, value]) => {
  // Original key (all lowercase)
  NORMALIZED_HOLOBOT_MAPPING[key] = value;
  
  // All uppercase version
  NORMALIZED_HOLOBOT_MAPPING[key.toUpperCase()] = value;
  
  // Capitalized version (e.g., "Ace")
  NORMALIZED_HOLOBOT_MAPPING[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] = value;
  
  // Add special case for Shadow and other potential problem cases
  if (key === "shadow") {
    NORMALIZED_HOLOBOT_MAPPING["Shadow"] = value;
  }
});

/**
 * Gets the correct image path for a holobot by its key/name
 * @param key The holobot key or name
 * @returns The image path for the holobot
 */
export const getHolobotImagePath = (key: string | undefined): string => {
  if (!key) {
    console.log("Missing holobot key, returning placeholder");
    return "/placeholder.svg";
  }
  
  // Remove any non-alphanumeric characters and trim
  const normalizedKey = key.trim().toLowerCase();
  
  console.log(`Getting image for holobot key: "${normalizedKey}" (original: "${key}")`);
  
  // First try the direct match in normalized mapping
  if (NORMALIZED_HOLOBOT_MAPPING[key]) {
    console.log(`Found direct match for original key "${key}": ${NORMALIZED_HOLOBOT_MAPPING[key]}`);
    return NORMALIZED_HOLOBOT_MAPPING[key];
  }
  
  // Try normalized key
  if (NORMALIZED_HOLOBOT_MAPPING[normalizedKey]) {
    console.log(`Found match in normalized mapping for "${normalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[normalizedKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[normalizedKey];
  }
  
  // If not found, try to extract just the holobot name 
  // (in case key contains additional info like "ace-lvl1")
  const possibleHolobotName = normalizedKey.split(/[^a-z0-9]/)[0];
  
  if (possibleHolobotName && NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]) {
    console.log(`Found match for extracted name "${possibleHolobotName}" from "${normalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]}`);
    return NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName];
  }
  
  // Final fallback: try all variations of capitalization of the key
  const capitalizedKey = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1);
  if (NORMALIZED_HOLOBOT_MAPPING[capitalizedKey]) {
    console.log(`Found match for capitalized key "${capitalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[capitalizedKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[capitalizedKey];
  }
  
  // Log error and return placeholder if no match found
  console.error(`No image found for holobot: "${normalizedKey}"`, { 
    originalKey: key,
    normalizedKey,
    possibleHolobotName,
    capitalizedKey,
    availableKeys: Object.keys(NORMALIZED_HOLOBOT_MAPPING).join(", ")
  });
  
  return "/placeholder.svg";
};
