export const CONTRACT_ADDRESSES = {
  holobotNFT: "0x94089f4b4b39bdbF0a39d27c60c8d7D92FC53acf",
  stockpile: "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
  treasury: "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  boosterStaker: "0x02F2A3739626D1772D4f6862101fd811D32267A7",
} as const;

export const CHAIN = {
  id: Number(import.meta.env.VITE_CHAIN_ID) || 84532, // Base Sepolia
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  basescanApiKey: "2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ",
} as const;

// Base Network Configuration
export const BASE_NETWORKS = {
  sepolia: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
  },
  mainnet: {
    id: 8453,
    name: "Base Mainnet", 
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
} as const;

// NFT Metadata Configuration
export const METADATA_CONFIG = {
  // ERC-721A Genesis Holobots - Sequential metadata (0.json, 1.json, 2.json...)
  GENESIS_BASE_URI: import.meta.env.VITE_GENESIS_BASE_URI || "ipfs://bafybeigdyrxyz.../",
  
  // ERC-1155 Parts - Template-based metadata ({id}.json)
  PARTS_BASE_URI: import.meta.env.VITE_PARTS_BASE_URI || "ipfs://bafybeib6abc.../{id}.json",
  
  // GitHub metadata repository
  GITHUB_METADATA_REPO: "https://github.com/Pak209/holobot-metadata",
} as const;

// Holos Ecosystem Contract Addresses  
export const HOLOS_CONTRACTS = {
  // Deployed contracts on Base Sepolia
  HOLOS_TOKEN: import.meta.env.VITE_HOLOS_TOKEN_ADDRESS || "0x5001178A8cBCd6F1866E9371ffae5fbEA6EA4072",
  RENTAL_CONVERSION_MANAGER: import.meta.env.VITE_RENTAL_CONVERSION_MANAGER_ADDRESS || "0x2E69041f98A90F5531fd235D6FB7A3e2E39D655a",
  SEASON1_NFT: import.meta.env.VITE_SEASON1_NFT_ADDRESS || "0x31F735bd19C74F1E5E795BCAcD0C9F5bA8695Bfa",
  MOCK_USDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || "0x5873f48274Bf71a9FA9E1aafeDf0C1664A982e7B",
  
  // Existing Holobots.fun contracts
  TREASURY: import.meta.env.VITE_TREASURY_ADDRESS || "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  STOCKPILE: import.meta.env.VITE_STOCKPILE_ADDRESS || "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
} as const;

// Environment variables (for server-side usage)
export const ENV = {
  privateKey: import.meta.env.PRIVATE_KEY,
  appName: import.meta.env.VITE_APP_NAME || "Holobots.fun",
  nodeEnv: import.meta.env.NODE_ENV || "development",
} as const;

// Type definitions for better TypeScript support
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ChainConfig = typeof CHAIN; 