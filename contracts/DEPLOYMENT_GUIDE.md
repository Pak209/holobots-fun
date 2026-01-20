# Deploy HolobotPublicMint Contract

## Quick Deploy with Remix (Easiest Method)

### Step 1: Open Remix
Go to https://remix.ethereum.org

### Step 2: Create New File
1. Create a new file called `HolobotPublicMint.sol`
2. Copy the contract code from `HolobotPublicMint.sol`

### Step 3: Compile
1. Go to the "Solidity Compiler" tab
2. Select compiler version `0.8.20` or higher
3. Click "Compile HolobotPublicMint.sol"

### Step 4: Deploy
1. Go to "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask" as the environment
3. Make sure MetaMask is on **Base Sepolia network**
4. In the constructor parameters, enter:
   - `baseURI`: `"https://holobots.fun/api/metadata/"`
5. Click "Deploy"
6. Confirm the transaction in MetaMask

### Step 5: Update Your App
After deployment, copy the contract address and update:

```typescript
// src/lib/constants.ts
export const CONTRACT_ADDRESSES = {
  holobotNFT: "YOUR_NEW_CONTRACT_ADDRESS_HERE", // Replace this
  stockpile: "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
  treasury: "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  boosterStaker: "0x02F2A3739626D1772D4f6862101fd811D32267A7",
};
```

## Contract Features

✅ **Public Minting**: Anyone can call `publicMint()` or `freeMint()`
✅ **Max Per Wallet**: 5 NFTs per wallet
✅ **Max Supply**: 10,000 total NFTs
✅ **Owner Privileges**: You can still mint to specific addresses as owner
✅ **Compatible**: Works with your existing mint UI

## Functions Available

- `publicMint()` - Free mint (no args)
- `freeMint()` - Alias for publicMint
- `mint(uint256 quantity)` - Mint multiple (up to limit)
- `ownerMint(address to, uint256 quantity)` - Owner only
- `setBaseURI(string baseURI)` - Update metadata URI
- `totalSupply()` - Get current supply

## Test After Deployment

1. Try minting from the Remix interface first
2. Then test from your app
3. Verify on BaseScan: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
