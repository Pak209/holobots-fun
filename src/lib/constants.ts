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
} as const;

// Environment variables (for server-side usage)
export const ENV = {
  privateKey: import.meta.env.PRIVATE_KEY,
  appName: import.meta.env.VITE_APP_NAME || "Holobots.fun",
} as const;

// Type definitions for better TypeScript support
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ChainConfig = typeof CHAIN; 