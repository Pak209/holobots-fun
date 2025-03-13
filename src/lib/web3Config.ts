
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3ReactHooks, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

// Use a placeholder or empty string instead of invalid project ID
const projectId = '';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon],
  [w3mProvider({ projectId })]
);

export const wagmiConfig = createConfig({
  autoConnect: false, // Disable auto-connect to prevent WebSocket errors
  connectors: w3mConnectors({ 
    projectId,
    chains
  }),
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Initialize MetaMask connector
const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

export const web3Connectors: [MetaMask, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
];
