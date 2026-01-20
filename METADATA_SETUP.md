# 🤖 Holobots NFT Metadata Setup Guide

This guide walks you through setting up and deploying NFT metadata for your Holobots project with proper Base network integration and IPFS hosting.

## 📋 Current Configuration

### ✅ Completed Setup

1. **Environment Variables**: Added Base network configuration to `src/lib/constants.ts`
2. **Metadata Structure**: Created proper ERC-721A and ERC-1155 metadata structure
3. **Sample Files**: Generated sample metadata for Genesis Holobots and Parts
4. **Validation Scripts**: Set up automated metadata validation
5. **Upload Scripts**: Created IPFS upload workflows for Pinata and Web3.Storage
6. **NPM Scripts**: Added convenient package.json commands

### 🔧 Environment Configuration

```typescript
// src/lib/constants.ts
export const BASE_NETWORKS = {
  sepolia: {
    id: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
  },
  mainnet: {
    id: 8453,
    rpcUrl: "https://mainnet.base.org", 
    explorer: "https://basescan.org",
  },
}

export const METADATA_CONFIG = {
  GENESIS_BASE_URI: import.meta.env.VITE_GENESIS_BASE_URI || "ipfs://bafybeigdyrxyz.../",
  PARTS_BASE_URI: import.meta.env.VITE_PARTS_BASE_URI || "ipfs://bafybeib6abc.../{id}.json",
}
```

## 🚀 Next Steps

### 1. Create Your .env File

Since `.env` files are gitignored, create your local environment file:

```bash
# Create .env file with your configuration
cat > .env << 'EOF'
# Base Network Configuration
BASESCAN_API_KEY=2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ
BASE_RPC_SEPOLIA=https://sepolia.base.org
BASE_RPC_MAINNET=https://mainnet.base.org

# NFT Metadata Configuration (will be updated after IPFS upload)
VITE_GENESIS_BASE_URI=ipfs://bafybeigdyrxyz.../
VITE_PARTS_BASE_URI=ipfs://bafybeib6abc.../{id}.json

# Environment
NODE_ENV=development
VITE_NODE_ENV=development
EOF
```

### 2. Customize Your Metadata

Edit the sample metadata files in `metadata/` to match your actual Holobot designs:

```bash
# Genesis Holobots (ERC-721A)
metadata/genesis/0.json
metadata/genesis/1.json
metadata/genesis/2.json

# Parts (ERC-1155)
metadata/parts/1.json
metadata/parts/2.json
metadata/parts/3.json
```

### 3. Add Your Images to IPFS

Upload your Holobot images to IPFS first, then update the metadata files with the correct image URLs:

```json
{
  "image": "ipfs://YOUR_IMAGE_CID/0.png"
}
```

### 4. Validate Metadata

Before uploading, always validate your metadata structure:

```bash
# Validate Genesis metadata
npm run metadata:validate:genesis

# Validate Parts metadata  
npm run metadata:validate:parts
```

### 5. Upload to IPFS

#### Option A: Using Pinata (Recommended)

```bash
# Install Pinata CLI
npm install -g @pinata/cli

# Authenticate with your JWT token
pinata auth YOUR_JWT_TOKEN

# Upload Genesis metadata
npm run metadata:upload:genesis

# Upload Parts metadata
npm run metadata:upload:parts
```

#### Option B: Using Web3.Storage

```bash
# Install Web3.Storage CLI
npm install -g web3.storage

# Authenticate
w3 login YOUR_EMAIL

# Upload
npm run metadata:upload:web3:genesis
npm run metadata:upload:web3:parts
```

### 6. Update Environment Variables

After successful uploads, update your `.env` with the returned CIDs:

```bash
# Example after upload
VITE_GENESIS_BASE_URI=ipfs://bafybeigl6kcn44qw3jjbv2vcxpjdnxj6jwu3jczr2z3w7b2q3q3q3q3q/
VITE_PARTS_BASE_URI=ipfs://bafybeigl6kcn44qw3jjbv2vcxpjdnxj6jwu3jczr2z3w7b2q3q3q3q3q/{id}.json
```

## 📚 Reference

### External Metadata Repository

Your metadata is also mirrored in: [https://github.com/Pak209/holobot-metadata](https://github.com/Pak209/holobot-metadata)

### Contract Integration

Once uploaded, your metadata URIs will be used in:

1. **ERC-721A Contract**: `GENESIS_BASE_URI` for sequential metadata
2. **ERC-1155 Contract**: `PARTS_BASE_URI` with `{id}` template replacement

### Directory Structure

```
holobots-fun/
├── metadata/
│   ├── genesis/          # ERC-721A files (0.json, 1.json, 2.json...)
│   ├── parts/           # ERC-1155 files (1.json, 2.json, 3.json...)
│   └── README.md
├── scripts/metadata/
│   ├── validate-metadata.js
│   ├── upload-to-ipfs.js
│   └── web3-storage-upload.js
├── src/lib/constants.ts  # Environment configuration
└── .env                 # Your local environment variables
```

### Available NPM Scripts

```bash
npm run metadata:validate:genesis     # Validate Genesis metadata
npm run metadata:validate:parts       # Validate Parts metadata
npm run metadata:upload:genesis       # Upload Genesis to Pinata
npm run metadata:upload:parts         # Upload Parts to Pinata
npm run metadata:upload:web3:genesis  # Upload Genesis to Web3.Storage
npm run metadata:upload:web3:parts    # Upload Parts to Web3.Storage
```

## 🔍 Validation Checklist

- [ ] Metadata files follow proper JSON structure
- [ ] Sequential numbering for Genesis (0.json, 1.json, 2.json...)
- [ ] Template compatibility for Parts ({id}.json format)
- [ ] All required fields present (name, description, image)
- [ ] IPFS image URLs are valid
- [ ] Validation scripts pass successfully
- [ ] IPFS upload completes without errors
- [ ] Environment variables updated with new CIDs

## 🚨 Troubleshooting

### Common Issues:

1. **ES Module Errors**: Scripts use ES modules, ensure Node.js 14+ and package.json has `"type": "module"`
2. **IPFS CLI Authentication**: Verify Pinata/Web3.Storage CLI is properly authenticated
3. **Sequential Files**: Genesis metadata must be numbered sequentially starting from 0
4. **JSON Validation**: Use online JSON validators if metadata seems malformed
5. **Network Issues**: Ensure stable internet connection for IPFS uploads

### Getting Help:

- Check the validation output for specific error messages
- Verify IPFS gateway accessibility: `https://ipfs.io/ipfs/YOUR_CID`
- Review the [GitHub metadata repository](https://github.com/Pak209/holobot-metadata) for reference structure

---

## 🎉 Success!

Once completed, your Holobots will have:
- ✅ Decentralized metadata on IPFS
- ✅ Base network integration
- ✅ ERC-721A compatible Genesis Holobots  
- ✅ ERC-1155 compatible Parts system
- ✅ Automated validation and deployment workflows
