
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

// Use empty string for project ID to avoid any connections
const projectId = '';

// Configure chains with transport: http to avoid WebSockets
const { chains, publicClient } = configureChains(
  [mainnet, polygon],
  [w3mProvider({ projectId })],
  { 
    pollingInterval: 10000, // Use polling instead of WebSockets
  }
);

export const wagmiConfig = createConfig({
  autoConnect: false, // Ensure web3 doesn't try to autoconnect
  connectors: w3mConnectors({ 
    projectId,
    chains
  }),
  publicClient,
  // Remove webSocketPublicClient to avoid WebSocket connections
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Initialize MetaMask connector
const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// Export connectors as a constant to make them referentially static
export const web3Connectors = [
  [metaMask, metaMaskHooks]
];
