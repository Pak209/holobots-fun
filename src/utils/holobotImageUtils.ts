
// Central source of truth for holobot image mappings
export const HOLOBOT_IMAGE_MAPPING: Record<string, string> = {
  "ace": "/lovable-uploads/26ccfc85-75a9-45fe-916d-52221d0114ca.png",
  "kuma": "/lovable-uploads/8538db67-52ba-404c-be52-f3bba93b356c.png",
  "shadow": "/lovable-uploads/85a2cf79-1889-472d-9855-3048f24a5597.png",
  "era": "/lovable-uploads/433db76f-724b-484e-bd07-b01fde68f661.png",
  "hare": "/lovable-uploads/c4359243-8486-4c66-9a1b-ee1f00a53fc6.png",
  "tora": "/lovable-uploads/7d5945ea-d44a-4028-8455-8f5f017fa601.png",
  "wake": "/lovable-uploads/538299bd-064f-4e42-beb2-cfc90c89efd2.png",
  "gama": "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png",
  "ken": "/lovable-uploads/3166d0da-114f-4b4b-8c65-79fc3f4e4789.png",
  "kurai": "/lovable-uploads/43352190-0af0-4ad7-aa3b-031a7a735552.png",
  "tsuin": "/lovable-uploads/dfc882db-6efe-449a-9a18-d58975a0799d.png",
  "wolf": "/lovable-uploads/fb0ae83c-7473-463b-a994-8d6fac2aca3c.png"
};

// Add uppercase variants to ensure consistent lookup regardless of case
const NORMALIZED_HOLOBOT_MAPPING: Record<string, string> = {};

// Create normalized mapping for case-insensitive lookups
Object.entries(HOLOBOT_IMAGE_MAPPING).forEach(([key, value]) => {
  NORMALIZED_HOLOBOT_MAPPING[key.toLowerCase()] = value;
  NORMALIZED_HOLOBOT_MAPPING[key.toUpperCase()] = value;
  // Also add capitalized version (e.g., "Ace")
  NORMALIZED_HOLOBOT_MAPPING[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] = value;
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
  
  console.log(`Getting image for holobot key: "${normalizedKey}"`);
  
  // First try the normalized mapping
  if (NORMALIZED_HOLOBOT_MAPPING[normalizedKey]) {
    console.log(`Found match in normalized mapping for "${normalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[normalizedKey]}`);
    return NORMALIZED_HOLOBOT_MAPPING[normalizedKey];
  }
  
  // If not found in normalized map, try to extract just the holobot name 
  // (in case key contains additional info like "ace-lvl1")
  const possibleHolobotName = normalizedKey.split(/[^a-z0-9]/)[0];
  
  if (possibleHolobotName && NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]) {
    console.log(`Found match for extracted name "${possibleHolobotName}" from "${normalizedKey}": ${NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName]}`);
    return NORMALIZED_HOLOBOT_MAPPING[possibleHolobotName];
  }
  
  // Log error and return placeholder if no match found
  console.error(`No image found for holobot: "${normalizedKey}"`, { 
    originalKey: key,
    normalizedKey,
    possibleHolobotName,
    availableKeys: Object.keys(NORMALIZED_HOLOBOT_MAPPING).join(", ")
  });
  
  return "/placeholder.svg";
};
