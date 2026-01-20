# Deploy HolobotPublicMint Contract

## Quick Deploy (Command Line)

### Step 1: Set Your Private Key

```bash
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

⚠️ **Important**: Use a deployer wallet with Base Sepolia ETH (you need ~0.01 ETH for gas)

### Step 2: Run Deployment

```bash
cd contracts
./deploy.sh
```

That's it! The script will:
- ✅ Install dependencies automatically
- ✅ Compile the contract
- ✅ Deploy to Base Sepolia
- ✅ Verify on BaseScan

### Step 3: Update Your App

After deployment, copy the contract address from the output and update:

```typescript
// src/lib/constants.ts
export const CONTRACT_ADDRESSES = {
  holobotNFT: "0xNEW_CONTRACT_ADDRESS_HERE", // ← Update this
  stockpile: "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
  treasury: "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  boosterStaker: "0x02F2A3739626D1772D4f6862101fd811D32267A7",
};
```

## Alternative: Manual Deploy with Remix

If you prefer a GUI, see `DEPLOYMENT_GUIDE.md` for Remix instructions.

## Contract Features

✅ **Public Minting** - Anyone can call `publicMint()` or `freeMint()`  
✅ **Max Per Wallet** - 5 NFTs per wallet  
✅ **Max Supply** - 10,000 total  
✅ **Free** - No payment required  
✅ **Owner Controls** - You can still mint to specific addresses  

## Troubleshooting

### "PRIVATE_KEY not set"
Run: `export PRIVATE_KEY=0xYourKey`

### "Insufficient funds"
Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia

### "forge: command not found"  
Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`

## After Deployment

1. ✅ Test minting from your app
2. ✅ Verify on BaseScan
3. ✅ Anyone should now be able to mint!
