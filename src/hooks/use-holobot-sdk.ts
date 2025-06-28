import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { initHolobotSDK, getReadOnlySDK, type HolobotSDK } from '@/lib/contracts';

export interface UseHolobotSDKReturn {
  sdk: HolobotSDK | null;
  readOnlySDK: HolobotSDK;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToCorrectChain: () => Promise<void>;
}

export function useHolobotSDK(): UseHolobotSDKReturn {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Read-only SDK (always available)
  const readOnlySDK = useMemo(() => getReadOnlySDK(), []);

  // Connected SDK (only available when wallet is connected)
  const sdk = useMemo(() => {
    if (!signer) return null;
    return initHolobotSDK(signer);
  }, [signer]);

  // Connect wallet
  const connect = async () => {
    try {
      if (!(window as any).ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  };

  // Switch to correct chain (Base Sepolia)
  const switchToCorrectChain = async () => {
    if (!provider) throw new Error('Wallet not connected');

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: '0x14a34' } // Base Sepolia: 84532 in hex
      ]);
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: '0x14a34',
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org/'],
          },
        ]);
      } else {
        throw error;
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        // Reconnect with new account
        connect();
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change to avoid issues
      window.location.reload();
    };

    const ethereum = (window as any).ethereum;
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [address]);

  return {
    sdk,
    readOnlySDK,
    isConnected,
    address,
    connect,
    disconnect,
    switchToCorrectChain,
  };
} 