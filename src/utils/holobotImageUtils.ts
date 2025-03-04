
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
  
  // Add special cases for each Holobot to ensure they match regardless of casing
  if (key === "ace") {
    NORMALIZED_HOLOBOT_MAPPING["Ace"] = value;
    NORMALIZED_HOLOBOT_MAPPING["ACE"] = value;
  } else if (key === "shadow") {
    NORMALIZED_HOLOBOT_MAPPING["Shadow"] = value;
    NORMALIZED_HOLOBOT_MAPPING["SHADOW"] = value;
  } else if (key === "kuma") {
    NORMALIZED_HOLOBOT_MAPPING["Kuma"] = value;
    NORMALIZED_HOLOBOT_MAPPING["KUMA"] = value;
  } else if (key === "era") {
    NORMALIZED_HOLOBOT_MAPPING["Era"] = value;
    NORMALIZED_HOLOBOT_MAPPING["ERA"] = value;
  } else if (key === "hare") {
    NORMALIZED_HOLOBOT_MAPPING["Hare"] = value;
    NORMALIZED_HOLOBOT_MAPPING["HARE"] = value;
  } else if (key === "tora") {
    NORMALIZED_HOLOBOT_MAPPING["Tora"] = value;
    NORMALIZED_HOLOBOT_MAPPING["TORA"] = value;
  } else if (key === "wake") {
    NORMALIZED_HOLOBOT_MAPPING["Wake"] = value;
    NORMALIZED_HOLOBOT_MAPPING["WAKE"] = value;
  } else if (key === "gama") {
    NORMALIZED_HOLOBOT_MAPPING["Gama"] = value;
    NORMALIZED_HOLOBOT_MAPPING["GAMA"] = value;
  } else if (key === "ken") {
    NORMALIZED_HOLOBOT_MAPPING["Ken"] = value;
    NORMALIZED_HOLOBOT_MAPPING["KEN"] = value;
  } else if (key === "kurai") {
    NORMALIZED_HOLOBOT_MAPPING["Kurai"] = value;
    NORMALIZED_HOLOBOT_MAPPING["KURAI"] = value;
  } else if (key === "tsuin") {
    NORMALIZED_HOLOBOT_MAPPING["Tsuin"] = value;
    NORMALIZED_HOLOBOT_MAPPING["TSUIN"] = value;
  } else if (key === "wolf") {
    NORMALIZED_HOLOBOT_MAPPING["Wolf"] = value;
    NORMALIZED_HOLOBOT_MAPPING["WOLF"] = value;
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
  
  // Trim the key and make a clean version
  const cleanKey = key.trim();
  
  console.log(`Getting image for holobot key: "${cleanKey}" (original: "${key}")`);
  
  // First try an exact match with the original key
  if (NORMALIZED_HOLOBOT_MAPPING[cleanKey]) {
    console.log(`Found direct match for key "${cleanKey}": ${NORMALIZED_HOLOBOT_MAPPING[cleanKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[cleanKey];
  }
  
  // Try lowercase version
  const lowercaseKey = cleanKey.toLowerCase();
  if (NORMALIZED_HOLOBOT_MAPPING[lowercaseKey]) {
    console.log(`Found match for lowercase key "${lowercaseKey}": ${NORMALIZED_HOLOBOT_MAPPING[lowercaseKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[lowercaseKey];
  }
  
  // Try capitalized version
  const capitalizedKey = lowercaseKey.charAt(0).toUpperCase() + lowercaseKey.slice(1);
  if (NORMALIZED_HOLOBOT_MAPPING[capitalizedKey]) {
    console.log(`Found match for capitalized key "${capitalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[capitalizedKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[capitalizedKey];
  }
  
  // If not found, try to extract just the holobot name 
  // (in case key contains additional info like "ace-lvl1")
  const possibleHolobotName = lowercaseKey.split(/[^a-z0-9]/)[0];
  
  if (possibleHolobotName && NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]) {
    console.log(`Found match for extracted name "${possibleHolobotName}" from "${lowercaseKey}": ${NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]}`);
    return NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName];
  }
  
  // Log error and return placeholder if no match found
  console.error(`No image found for holobot: "${cleanKey}"`, { 
    originalKey: key,
    cleanKey,
    lowercaseKey,
    capitalizedKey,
    possibleHolobotName,
    availableKeys: Object.keys(NORMALIZED_HOLOBOT_MAPPING).join(", ")
  });
  
  return "/placeholder.svg";
};
