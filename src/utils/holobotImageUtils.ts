// Central source of truth for holobot image mappings
export const HOLOBOT_IMAGE_MAPPING: Record<string, string> = {
  "ACE": "/lovable-uploads/7223a5e5-abcb-4911-8436-bddbbd851ae2.png", // Updated path for ace.png
  "KUMA": "/lovable-uploads/78f2c37a-43a3-4cce-a767-bc3f614e7a80.png", // Updated path for kuma.png
  "SHADOW": "/lovable-uploads/ef60f626-b571-46ba-9d37-6045b020669a.png", // Updated path for shadow.png
  "ERA": "/lovable-uploads/c2cd6b0a-0e49-4ede-9507-e55d05aa608d.png", // Updated path for era.png
  "HARE": "/lovable-uploads/4ad952b3-4337-4120-9542-ed14ca1051d5.png", // Updated path for hare.png
  "TORA": "/lovable-uploads/e79a5ab6-4577-4e0e-a2b9-32cafd91a212.png", // Updated path for tora.png
  "WAKE": "/lovable-uploads/wake.png",
  "GAMA": "/lovable-uploads/4af336bd-2825-4faf-9b2c-58cc86354b14.png", // Updated path for gama.png
  "KEN": "/lovable-uploads/58e4110e-07f8-44ab-983e-b6caa5098cc3.png", // Updated path for ken.png
  "KURAI": "/lovable-uploads/a2ce9d10-b01e-4b86-b52b-74f196b39a6c.png", // Updated path for kurai.png
  "TSUIN": "/lovable-uploads/e6982da0-9c53-4d62-a2b8-7ede52d89ca7.png", // Updated path for tsuin.png
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
  
  // Special handling for "hare"
  if (cleanKey.toLowerCase() === "hare") {
    console.log(`Special handling for hare: ${HOLOBOT_IMAGE_MAPPING["HARE"]}`);
    return HOLOBOT_IMAGE_MAPPING["HARE"];
  }
  
  // Special handling for "ken"
  if (cleanKey.toLowerCase() === "ken") {
    console.log(`Special handling for ken: ${HOLOBOT_IMAGE_MAPPING["KEN"]}`);
    return HOLOBOT_IMAGE_MAPPING["KEN"];
  }
  
  // Special handling for "kurai"
  if (cleanKey.toLowerCase() === "kurai") {
    console.log(`Special handling for kurai: ${HOLOBOT_IMAGE_MAPPING["KURAI"]}`);
    return HOLOBOT_IMAGE_MAPPING["KURAI"];
  }
  
  // Special handling for "tora"
  if (cleanKey.toLowerCase() === "tora") {
    console.log(`Special handling for tora: ${HOLOBOT_IMAGE_MAPPING["TORA"]}`);
    return HOLOBOT_IMAGE_MAPPING["TORA"];
  }
  
  // Special handling for "tsuin"
  if (cleanKey.toLowerCase() === "tsuin") {
    console.log(`Special handling for tsuin: ${HOLOBOT_IMAGE_MAPPING["TSUIN"]}`);
    return HOLOBOT_IMAGE_MAPPING["TSUIN"];
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
