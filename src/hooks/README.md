# Holobot Smart Contract Hooks (Wagmi + RainbowKit)

This directory contains React hooks for interacting with Holobot smart contracts using wagmi and RainbowKit.

## Overview

The hooks provide a clean, type-safe interface for:
- 🔌 **Wallet Connection** - RainbowKit integration with multiple wallet support
- 📜 **Smart Contracts** - Type-safe contract interactions
- 🔗 **Network Management** - Automatic chain switching and validation
- ⚡ **State Management** - Reactive wallet and contract state

## Quick Start

### 1. Basic Setup

Your app is already wrapped with the necessary providers in `App.tsx`:

```typescript
<QueryClientProvider client={queryClient}>
  <WagmiProvider config={wagmiConfig}>
    <RainbowKitProvider>
      {/* Your app */}
    </RainbowKitProvider>
  </WagmiProvider>
</QueryClientProvider>
```

### 2. Connect Wallet

```typescript
import { WalletConnectButton } from '@/components/WalletConnectButton';

function MyComponent() {
  return <WalletConnectButton />;
}
```

### 3. Use Contracts

```typescript
import { useHolobotContracts } from '@/hooks/useHolobotContracts';

function MyComponent() {
  const { contracts, isConnected, address } = useHolobotContracts();

  const mintHolobot = async () => {
    if (!contracts.holobot || !isConnected) return;
    
    const tx = await contracts.holobot.mint(address, tokenId);
    await tx.wait();
  };

  return (
    <button onClick={mintHolobot} disabled={!isConnected}>
      Mint Holobot
    </button>
  );
}
```

## Available Hooks

### Core Hooks

#### `useHolobotContracts()`
Main hook providing access to all contracts and wallet state.

```typescript
const {
  // Wallet state
  address,
  isConnected,
  isConnecting,
  connect,
  disconnect,

  // Contracts (auto-switches between read/write based on connection)
  contracts: {
    holobot,
    stockpile,
    treasury,
    boosterStaker,
  },

  // Always available (read-only)
  readOnlyContracts: { /* same */ },

  // Only available when wallet connected
  writeContracts: { /* same */ },
} = useHolobotContracts();
```

#### `useNetworkCheck()`
Check if user is on the correct network.

```typescript
const {
  isCorrectNetwork,
  currentChainId,
  requiredChainId, // 84532 (Base Sepolia)
  chainName,
} = useNetworkCheck();
```

### Contract-Specific Hooks

#### `useHolobotNFT()`
```typescript
const { contract, readOnlyContract, writeContract, isConnected } = useHolobotNFT();

// Specialized hooks
const { getBalance } = useHolobotBalance();
const { mint } = useHolobotMint();
```

#### `useStockpile()`
```typescript
const { contract, readOnlyContract, writeContract, isConnected } = useStockpile();

// Specialized hooks
const { getBalance } = useStockpileBalance();
const { deposit } = useStockpileDeposit();
const { withdraw } = useStockpileWithdraw();
const { getRewards, claimRewards } = useStockpileRewards();
```

#### `useTreasury()`
```typescript
const { contract, readOnlyContract, writeContract, isConnected } = useTreasury();

// Specialized hooks
const { getBalance } = useTreasuryBalance();
const { deposit } = useTreasuryDeposit();
const { withdraw } = useTreasuryWithdraw();
```

#### `useBoosterStaker()`
```typescript
const { contract, readOnlyContract, writeContract, isConnected } = useBoosterStaker();

// Specialized hooks
const { stake, unstake } = useBoosterStaking();
const { getStakedTokens } = useStakedBoosterPacks();
const { getRewards, claimRewards } = useBoosterStakeRewards();
```

## Usage Examples

### Mint a Holobot
```typescript
import { useHolobotMint } from '@/hooks/useHolobotNFT';

function MintButton() {
  const { mint } = useHolobotMint();

  const handleMint = async () => {
    try {
      const tokenId = Math.floor(Math.random() * 10000);
      const receipt = await mint(tokenId);
      console.log('Minted!', receipt.hash);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  return <button onClick={handleMint}>Mint Holobot</button>;
}
```

### Check Stockpile Balance
```typescript
import { useStockpileBalance } from '@/hooks/useStockpile';
import { useEffect, useState } from 'react';

function StockpileBalanceDisplay() {
  const { getBalance } = useStockpileBalance();
  const [balance, setBalance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    getBalance().then(setBalance);
  }, [getBalance]);

  return (
    <div>
      Stockpile Balance: {balance.toString()} tokens
    </div>
  );
}
```

### Stake Booster Pack
```typescript
import { useBoosterStaking } from '@/hooks/useBoosterStaker';

function StakeBoosterButton({ tokenId }: { tokenId: number }) {
  const { stake } = useBoosterStaking();

  const handleStake = async () => {
    try {
      const receipt = await stake(tokenId);
      console.log('Staked!', receipt.hash);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  return <button onClick={handleStake}>Stake Booster Pack</button>;
}
```

## Network Configuration

The app is configured for Base Sepolia (testnet) by default:

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

Users will be prompted to switch networks if they're on the wrong chain.

## Environment Setup

Add to your `.env` file:

```bash
# Get from https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Error Handling

All hooks include built-in error handling:

```typescript
try {
  const tx = await contract.someMethod();
  await tx.wait();
} catch (error) {
  // Hooks automatically log errors
  // Handle user-facing error states here
}
```

## TypeScript Support

All hooks are fully typed with:
- Contract method signatures
- Return types
- Error types
- Wallet connection states

## Best Practices

1. **Always check connection state** before calling write methods
2. **Use the unified hook** (`useHolobotContracts`) for most use cases
3. **Handle network switching** with `useNetworkCheck`
4. **Wrap transactions in try-catch** blocks
5. **Show loading states** during transactions
6. **Use specialized hooks** for specific functionality

## Migration from Manual ethers

If migrating from manual ethers setup:

```typescript
// Before (manual ethers)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = getHolobotContract(signer);

// After (wagmi hooks)
const { contracts } = useHolobotContracts();
const contract = contracts.holobot;
```

## Troubleshooting

### Common Issues

1. **"Wallet not connected"** - Check `isConnected` before calling write methods
2. **"Wrong network"** - Use `useNetworkCheck` to prompt network switching
3. **Transaction fails** - Check user has sufficient gas and tokens
4. **Hook not updating** - Ensure component is wrapped in wagmi providers

### Debug Mode

Enable wagmi devtools in development:

```typescript
import { devtools } from '@tanstack/react-query-devtools';

// Add to your app
<ReactQueryDevtools initialIsOpen={false} />
``` 