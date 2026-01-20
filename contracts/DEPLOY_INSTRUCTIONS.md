# ✅ Contract Compiled Successfully!

Your HolobotPublicMint contract is ready to deploy.

## 🚀 Deploy Now

Run this command with your private key:

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun/contracts

PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE forge script Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key 2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ \
  -vvv
```

Replace `0xYOUR_PRIVATE_KEY_HERE` with your actual private key (the wallet with 0.226 ETH).

## After Deployment

The contract address will be displayed. Then update `src/lib/constants.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  holobotNFT: "NEW_CONTRACT_ADDRESS",  // ← Update this
  stockpile: "0x087E6a57b63a251b2D1a9cc5D5d0d843dDF4ea58",
  treasury: "0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C",
  boosterStaker: "0x02F2A3739626D1772D4f6862101fd811D32267A7",
};
```

## Or Use the Shell Script

Alternatively, run:

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun/contracts
PRIVATE_KEY=0xYOUR_PRIVATE_KEY ./deploy.sh
```

🎉 **Ready to deploy when you are!**
