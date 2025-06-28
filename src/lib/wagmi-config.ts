import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { CHAIN } from './constants';

export const wagmiConfig = getDefaultConfig({
  appName: 'Holobots.fun',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id', // Get from WalletConnect Cloud
  chains: [baseSepolia, base],
  ssr: false, // Since this is not a Next.js app
});

// Export chain configuration for easy access
export const supportedChains = [baseSepolia, base];
export const defaultChain = baseSepolia; 