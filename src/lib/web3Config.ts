import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';

// Configure chains & providers
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // You'll need to provide this

const { chains, publicClient } = configureChains(
  [mainnet, polygon],
  [w3mProvider({ projectId })]
);

// Set up wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// Web3Modal Ethereum Client
export const ethereumClient = new EthereumClient(wagmiConfig, chains);