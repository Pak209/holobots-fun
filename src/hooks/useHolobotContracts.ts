import { useHolobotNFT } from './useHolobotNFT';
import { useStockpile } from './useStockpile';
import { useTreasury } from './useTreasury';
import { useBoosterStaker } from './useBoosterStaker';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

/**
 * Unified hook that provides access to all Holobot contracts
 * This is the main hook you should use in your components
 */
export function useHolobotContracts() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Get all contract hooks
  const holobot = useHolobotNFT();
  const stockpile = useStockpile();
  const treasury = useTreasury();
  const boosterStaker = useBoosterStaker();

  return {
    // Account info
    address,
    isConnected,
    isConnecting,
    
    // Connection controls
    connect: openConnectModal,
    disconnect,

    // Contracts
    contracts: {
      holobot: holobot.contract,
      stockpile: stockpile.contract,
      treasury: treasury.contract,
      boosterStaker: boosterStaker.contract,
    },

    // Read-only contracts (always available)
    readOnlyContracts: {
      holobot: holobot.readOnlyContract,
      stockpile: stockpile.readOnlyContract,
      treasury: treasury.readOnlyContract,
      boosterStaker: boosterStaker.readOnlyContract,
    },

    // Write contracts (only available when connected)
    writeContracts: {
      holobot: holobot.writeContract,
      stockpile: stockpile.writeContract,
      treasury: treasury.writeContract,
      boosterStaker: boosterStaker.writeContract,
    },
  };
}

/**
 * Hook for checking if user is on the correct network
 */
export function useNetworkCheck() {
  const { chain } = useAccount();
  const isCorrectNetwork = chain?.id === 84532; // Base Sepolia

  return {
    isCorrectNetwork,
    currentChainId: chain?.id,
    requiredChainId: 84532,
    chainName: chain?.name,
  };
} 