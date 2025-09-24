# 🚀 Holobots Deployment Checklist

Based on your deployment plan, here's the step-by-step execution guide.

## ✅ Completed Setup
- [x] Environment configuration in `src/lib/constants.ts`
- [x] Metadata structure created (Genesis + Parts)
- [x] IPFS upload scripts ready
- [x] Smart contract helper scripts created
- [x] Package.json scripts configured

## 🎯 Next Steps to Execute

### 1️⃣ Finalize Environment Variables

**In `onchain/.env` set:**
```ini
PRIVATE_KEY=0x...                    # deployer EOA
BASE_RPC_SEPOLIA=https://sepolia.base.org
BASE_RPC_MAINNET=https://mainnet.base.org
BASESCAN_API_KEY=2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ
GENESIS_BASE_URI=ipfs://<CID>/       # MUST end with /
PARTS_BASE_URI=ipfs://<CID>/{id}.json
ROYALTY_BPS=500

# For role management
MINTER_SIGNER_ADDRESS=0xYourMintSigner
SAFE_ADDRESS=0xYourSafe
```

### 2️⃣ Deploy to Base Sepolia (Testnet)

```bash
cd onchain
npm i
npm run build
npm run deploy:sepolia
```

**Then commit addresses:**
```bash
git add onchain && git commit -m "chore: update onchain addresses (sepolia)" && git push
```

### 3️⃣ Verify & Role Setup

**If verify didn't auto-run:**
```bash
npx hardhat verify --network baseSepolia <HOLOBOTS_IMPL>
npx hardhat verify --network baseSepolia <PARTS_IMPL>
```

**Grant roles using helper script:**
```bash
MINTER_SIGNER_ADDRESS=0x... SAFE_ADDRESS=0x... npm run grant-roles:sepolia
```

### 4️⃣ Smoke-mint on Sepolia

```bash
npm run mint-samples:sepolia
```

**Confirm on BaseScan the tokens/metadata resolve.**

### 5️⃣ Frontend Test

```bash
cd ../
npm run dev
# open http://localhost:8080/mint-genesis
```

Connect the **MINTER_ROLE** wallet; press **Mint Genesis** → confirm success.

### 6️⃣ Do a Tiny Upgrade (Builder Signal)

```bash
cd onchain
HOLOBOTS_PROXY=0xHOLOBOTS_PROXY PARTS_PROXY=0xPARTS_PROXY npm run upgrade:sepolia
```

### 7️⃣ Harden for Mainnet

- [ ] Move **DEFAULT_ADMIN_ROLE/UPGRADER_ROLE** to a **Gnosis Safe**
- [ ] Keep **MINTER_ROLE** on a separate signer (server/EOA)
- [ ] Add **DEPLOYMENTS.md** with addresses, roles, and links
- [ ] Pin metadata CIDs on **at least two pinning providers** (redundancy)

### 8️⃣ Mainnet Deploy

```bash
npm run deploy:base
# verify + roles as above, one test mint (1 token), then revoke if needed
```

Update the app to use `addresses.base.*` for prod.

### 9️⃣ Day-1 Activity Burst (Airdrop Options)

- [ ] Batch-mint a small **1155 Founders Chip** to early bridgers/minters
- [ ] Publish addresses + **"Bridge → Mint → Claim"** thread (X/Farcaster)
- [ ] Label contracts on **BaseScan**
- [ ] Optional next: **Merkle Claim contract** + **Farcaster Frame**

## 🔧 Available Helper Scripts

### Deployment:
```bash
npm run build                    # Compile contracts
npm run deploy:sepolia          # Deploy to Base Sepolia
npm run deploy:base             # Deploy to Base Mainnet
npm run upgrade:sepolia         # Upgrade on Base Sepolia
npm run upgrade:base            # Upgrade on Base Mainnet
```

### Management:
```bash
npm run grant-roles:sepolia     # Grant MINTER/UPGRADER roles
npm run grant-roles:base        # Grant roles on mainnet
npm run mint-samples:sepolia    # Test minting
npm run mint-samples:base       # Mainnet test minting
```

### Metadata:
```bash
npm run metadata:validate:genesis     # Validate Genesis metadata
npm run metadata:validate:parts       # Validate Parts metadata
npm run metadata:upload:genesis       # Upload Genesis to IPFS
npm run metadata:upload:parts         # Upload Parts to IPFS
```

## 🎯 Ready to Execute!

Your setup is complete. The next step is to:

1. **Upload your metadata to IPFS** using the metadata scripts
2. **Configure your `.env` file** with the returned CIDs
3. **Run the deployment sequence** starting with Sepolia

Would you like me to help you execute any of these steps?
