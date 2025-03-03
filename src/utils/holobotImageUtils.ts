
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
  
  // Convert to lowercase for consistent comparison
  const normalizedKey = key.toLowerCase().trim();
  
  console.log(`Getting image for holobot: ${normalizedKey}`);
  
  // Log all keys for debugging
  console.log("Available holobot keys:", Object.keys(HOLOBOT_IMAGE_MAPPING));
  
  // Direct match - this is the primary lookup method
  if (HOLOBOT_IMAGE_MAPPING[normalizedKey]) {
    console.log(`Found direct image match for ${normalizedKey}: ${HOLOBOT_IMAGE_MAPPING[normalizedKey]}`);
    return HOLOBOT_IMAGE_MAPPING[normalizedKey];
  }
  
  // Try to find a case-insensitive match among the keys
  const matchingKey = Object.keys(HOLOBOT_IMAGE_MAPPING).find(
    mapKey => mapKey.toLowerCase() === normalizedKey
  );
  
  if (matchingKey) {
    console.log(`Found case-insensitive match for ${normalizedKey}: ${HOLOBOT_IMAGE_MAPPING[matchingKey]}`);
    return HOLOBOT_IMAGE_MAPPING[matchingKey];
  }
  
  // Log error and return placeholder
  console.error(`No image found for holobot: ${normalizedKey}`, { 
    normalizedKey, 
    availableKeys: Object.keys(HOLOBOT_IMAGE_MAPPING).join(", ") 
  });
  return "/placeholder.svg";
};
