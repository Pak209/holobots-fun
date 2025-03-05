// Central source of truth for holobot image mappings
export const HOLOBOT_IMAGE_MAPPING: Record<string, string> = {
  "ACE": "/lovable-uploads/7223a5e5-abcb-4911-8436-bddbbd851ae2.png", // Updated path for ace.png
  "KUMA": "/lovable-uploads/78f2c37a-43a3-4cce-a767-bc3f614e7a80.png", // Updated path for kuma.png
  "SHADOW": "/lovable-uploads/ef60f626-b571-46ba-9d37-6045b020669a.png", // Updated path for shadow.png
  "ERA": "/lovable-uploads/c2cd6b0a-0e49-4ede-9507-e55d05aa608d.png", // Updated path for era.png
  "HARE": "/lovable-uploads/hare.png",
  "TORA": "/lovable-uploads/tora.png",
  "WAKE": "/lovable-uploads/wake.png",
  "GAMA": "/lovable-uploads/4af336bd-2825-4faf-9b2c-58cc86354b14.png", // Updated path for gama.png
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
  
  // Special handling for "ace"
  if (cleanKey.toLowerCase() === "ace") {
    console.log(`Special handling for ace: ${HOLOBOT_IMAGE_MAPPING["ACE"]}`);
    return HOLOBOT_IMAGE_MAPPING["ACE"];
  }
  
  // Special handling for "era"
  if (cleanKey.toLowerCase() === "era") {
    console.log(`Special handling for era: ${HOLOBOT_IMAGE_MAPPING["ERA"]}`);
    return HOLOBOT_IMAGE_MAPPING["ERA"];
  }
  
  // Special handling for "shadow"
  if (cleanKey.toLowerCase() === "shadow") {
    console.log(`Special handling for shadow: ${HOLOBOT_IMAGE_MAPPING["SHADOW"]}`);
    return HOLOBOT_IMAGE_MAPPING["SHADOW"];
  }
  
  // Special handling for "kuma"
  if (cleanKey.toLowerCase() === "kuma") {
    console.log(`Special handling for kuma: ${HOLOBOT_IMAGE_MAPPING["KUMA"]}`);
    return HOLOBOT_IMAGE_MAPPING["KUMA"];
  }
  
  // Special handling for "gama"
  if (cleanKey.toLowerCase() === "gama") {
    console.log(`Special handling for gama: ${HOLOBOT_IMAGE_MAPPING["GAMA"]}`);
    return HOLOBOT_IMAGE_MAPPING["GAMA"];
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
