# Holobots NFT Metadata

This directory contains the metadata structure for Holobots NFTs, supporting both ERC-721A Genesis Holobots and ERC-1155 Parts.

## Structure

```
metadata/
├── genesis/          # ERC-721A Sequential metadata (0.json, 1.json, 2.json...)
│   ├── 0.json       # Genesis Holobot #0
│   ├── 1.json       # Genesis Holobot #1
│   └── 2.json       # Genesis Holobot #2
├── parts/           # ERC-1155 Template-based metadata ({id}.json)
│   ├── 1.json       # Part ID 1
│   ├── 2.json       # Part ID 2
│   └── 3.json       # Part ID 3
└── README.md
```

## ERC-721A Genesis Holobots

Genesis Holobots use sequential numbering starting from 0. Each file follows the standard:

- **File naming**: `0.json`, `1.json`, `2.json`, etc.
- **Token ID**: Matches the filename number
- **Base URI**: Set as `GENESIS_BASE_URI` environment variable

### Example Genesis Metadata Structure:
```json
{
  "name": "Holobot #0",
  "description": "Genesis Holobot description...",
  "image": "ipfs://CID/images/0.png",
  "external_url": "https://holobots.fun/holobot/0",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Genesis"
    }
  ]
}
```

## ERC-1155 Parts

Parts use template-based metadata with `{id}` replacement in the URI.

- **File naming**: `1.json`, `2.json`, `3.json`, etc.
- **Token ID**: Matches the filename number
- **Base URI**: Set as `PARTS_BASE_URI` with `{id}.json` template

### Example Parts Metadata Structure:
```json
{
  "name": "Holobot Head - Alpha",
  "description": "A premium head component...",
  "image": "ipfs://CID/parts/head_alpha.png",
  "external_url": "https://holobots.fun/parts/1",
  "attributes": [
    {
      "trait_type": "Part Type",
      "value": "Head"
    }
  ]
}
```

## IPFS Upload Workflow

### Option A: Using Pinata

1. **Install Pinata CLI:**
   ```bash
   npm install -g @pinata/cli
   ```

2. **Authenticate:**
   ```bash
   pinata auth YOUR_JWT_TOKEN
   ```

3. **Upload Genesis metadata:**
   ```bash
   node scripts/metadata/upload-to-ipfs.js genesis
   ```

4. **Upload Parts metadata:**
   ```bash
   node scripts/metadata/upload-to-ipfs.js parts
   ```

### Option B: Using Web3.Storage

1. **Install Web3.Storage CLI:**
   ```bash
   npm install -g web3.storage
   ```

2. **Authenticate:**
   ```bash
   w3 login YOUR_EMAIL
   ```

3. **Upload:**
   ```bash
   node scripts/metadata/web3-storage-upload.js genesis
   node scripts/metadata/web3-storage-upload.js parts
   ```

## Environment Configuration

After uploading to IPFS, add the returned CIDs to your environment:

### For Genesis Holobots (ERC-721A):
```bash
VITE_GENESIS_BASE_URI=ipfs://bafybeigdyrxyz.../
```

### For Parts (ERC-1155):
```bash
VITE_PARTS_BASE_URI=ipfs://bafybeib6abc.../{id}.json
```

## Validation

Before uploading, validate your metadata structure:

```bash
# Validate Genesis metadata
node scripts/metadata/validate-metadata.js genesis

# Validate Parts metadata
node scripts/metadata/validate-metadata.js parts
```

## Integration with Contracts

The uploaded IPFS URIs are automatically configured in:

- `src/lib/constants.ts` - Frontend configuration
- Smart contract deployment scripts - Backend configuration

## External Repository

Metadata is also maintained in the [holobot-metadata repository](https://github.com/Pak209/holobot-metadata) for backup and public access.

## Best Practices

1. **Sequential Numbering**: Ensure Genesis files are numbered sequentially starting from 0
2. **Consistent Attributes**: Use consistent trait_type names across all metadata
3. **IPFS Images**: Store images on IPFS for decentralization
4. **Validation**: Always run validation before uploading
5. **Backup**: Keep metadata in version control (GitHub repository)

## Troubleshooting

### Common Issues:

1. **Missing Files**: Ensure sequential numbering for Genesis (0.json, 1.json, 2.json...)
2. **Invalid JSON**: Use a JSON validator before uploading
3. **IPFS Access**: Verify IPFS gateway accessibility
4. **Authentication**: Ensure Pinata/Web3.Storage CLI is properly authenticated
