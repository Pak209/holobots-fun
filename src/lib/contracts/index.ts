// Contract helpers
export * from './holobotNFT';
export * from './stockpile';
export * from './treasury';
export * from './boosterStaker';

// Re-export constants for convenience
export { CONTRACT_ADDRESSES, CHAIN, ENV } from '@/lib/constants';

// Unified SDK interface
import { ethers } from 'ethers';
import { getHolobotContract } from './holobotNFT';
import { getStockpileContract } from './stockpile';
import { getTreasuryContract } from './treasury';
import { getBoosterStakerContract } from './boosterStaker';

export interface HolobotSDK {
  holobot: ReturnType<typeof getHolobotContract>;
  stockpile: ReturnType<typeof getStockpileContract>;
  treasury: ReturnType<typeof getTreasuryContract>;
  boosterStaker: ReturnType<typeof getBoosterStakerContract>;
}

/**
 * Initialize the Holobot SDK with all contracts
 * @param provider - Ethers provider or signer
 * @returns Object containing all initialized contracts
 */
export function initHolobotSDK(provider: ethers.Provider | ethers.Signer): HolobotSDK {
  return {
    holobot: getHolobotContract(provider),
    stockpile: getStockpileContract(provider),
    treasury: getTreasuryContract(provider),
    boosterStaker: getBoosterStakerContract(provider),
  };
}

/**
 * Helper to get a read-only SDK instance using the default RPC
 */
export function getReadOnlySDK(): HolobotSDK {
  const { CHAIN } = require('@/lib/constants');
  const provider = new ethers.JsonRpcProvider(CHAIN.rpcUrl);
  return initHolobotSDK(provider);
} 