import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { CHAIN } from './constants';

// Explicitly define Base Sepolia with hardcoded Chain ID and reliable RPC endpoints
export const baseSepoliaCustom = defineChain({
  id: 84532, // HARDCODED - Base Sepolia Chain ID
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://sepolia.base.org', // Primary RPC
        'https://base-sepolia.blockpi.network/v1/rpc/public', // Fallback 1
        'https://base-sepolia-rpc.publicnode.com', // Fallback 2
      ],
    },
    public: {
      http: [
        'https://sepolia.base.org',
        'https://base-sepolia.blockpi.network/v1/rpc/public',
        'https://base-sepolia-rpc.publicnode.com',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: 'Holobots.fun',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [baseSepoliaCustom], // ONLY Base Sepolia with custom config
  ssr: false,
});

// Export chain configuration for easy access
export const supportedChains = [baseSepoliaCustom];
export const defaultChain = baseSepoliaCustom; 