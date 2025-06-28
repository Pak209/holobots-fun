# Holobot Smart Contract SDK

A TypeScript SDK for interacting with Holobot smart contracts on Base Sepolia.

## Overview

This SDK provides type-safe contract interactions for:
- **HolobotNFT**: NFT minting and management
- **Stockpile**: Token staking and rewards
- **Treasury**: Treasury management
- **BoosterStaker**: Booster pack staking

## Quick Start

### 1. Individual Contract Usage

```typescript
import { getHolobotContract, mintHolobot } from '@/lib/contracts';
import { ethers } from 'ethers';

// Initialize provider
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Get contract instance
const holobotContract = getHolobotContract(signer);

// Mint a Holobot
await mintHolobot(holobotContract, userAddress, tokenId);
```

### 2. Unified SDK Usage

```typescript
import { initHolobotSDK } from '@/lib/contracts';
import { ethers } from 'ethers';

// Initialize the full SDK
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const sdk = initHolobotSDK(signer);

// Use any contract
const balance = await sdk.holobot.balanceOf(userAddress);
const rewards = await sdk.stockpile.getRewards(userAddress);
```

### 3. Read-Only Operations

```typescript
import { getReadOnlySDK } from '@/lib/contracts';

// Get read-only SDK (no wallet needed)
const sdk = getReadOnlySDK();

// Query contract state
const owner = await sdk.holobot.ownerOf(tokenId);
const treasuryBalance = await sdk.treasury.getTreasuryBalance();
```

## Contract Functions

### HolobotNFT
- `mintHolobot(contract, to, tokenId)` - Mint a new Holobot
- `getHolobotOwner(contract, tokenId)` - Get token owner
- `getHolobotBalance(contract, owner)` - Get owner's balance
- `getHolobotTokenURI(contract, tokenId)` - Get token metadata URI

### Stockpile
- `getStockpileBalance(contract, user)` - Get user's staked balance
- `depositToStockpile(contract, amount)` - Deposit tokens
- `withdrawFromStockpile(contract, amount)` - Withdraw tokens
- `getStockpileRewards(contract, user)` - Get pending rewards
- `claimStockpileRewards(contract)` - Claim rewards

### Treasury
- `getTreasuryBalance(contract)` - Get treasury balance
- `depositToTreasury(contract, amount)` - Deposit to treasury
- `withdrawFromTreasury(contract, amount, to)` - Withdraw from treasury
- `getTreasuryOwner(contract)` - Get treasury owner

### BoosterStaker
- `stakeBoosterPack(contract, tokenId)` - Stake a booster pack
- `unstakeBoosterPack(contract, tokenId)` - Unstake a booster pack
- `getStakedBoosterPacks(contract, user)` - Get user's staked tokens
- `getStakeRewards(contract, user)` - Get staking rewards
- `claimStakeRewards(contract)` - Claim staking rewards

## Configuration

Contract addresses and chain config are managed in `/lib/constants.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  holobotNFT: "0x94089f4b4b39bdbF0a39d27c60c8d7D92FC53acf",
  stockpile: "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
  treasury: "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  boosterStaker: "0x02F2A3739626D1772D4f6862101fd811D32267A7",
};
```

## Error Handling

Always wrap contract calls in try-catch blocks:

```typescript
try {
  const tx = await mintHolobot(contract, userAddress, tokenId);
  console.log('Transaction hash:', tx.hash);
} catch (error) {
  console.error('Minting failed:', error);
}
```

## ABIs

Contract ABIs are stored in `/abis/` and can be replaced with actual contract ABIs when available. 