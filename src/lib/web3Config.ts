import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { EthereumClient, w3mConnector, w3mProvider } from '@web3modal/ethereum';
import { Web3ReactHooks, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2';

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon],
  [w3mProvider({ projectId })]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [w3mConnector({ projectId, chains })],
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Initialize MetaMask connector
const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// Initialize WalletConnect connector
const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnectV2>(
  (actions) => new WalletConnectV2({
    actions,
    options: {
      projectId,
      chains,
      showQrModal: true,
    },
  })
);

export const web3Connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
] as const;