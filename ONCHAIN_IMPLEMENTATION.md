# Holobots Day-1 On-Chain Implementation

## Overview

This implementation adds a complete Day-1 blockchain integration to the Holobots project, featuring UUPS upgradeable smart contracts and a clean admin minting interface.

## Project Structure

```
holobots-fun/
├── onchain/                          # Git submodule for contracts
│   ├── contracts/
│   │   ├── Holobots721A.sol          # ERC721A + ERC2981 + UUPS
│   │   └── Parts1155.sol             # ERC1155 + ERC2981 + UUPS
│   ├── scripts/
│   │   ├── 01_deploy_holobots721a.ts # Deploy script
│   │   ├── 02_deploy_parts1155.ts    # Deploy script
│   │   ├── 10_upgrade_holobots721a.ts # Upgrade script
│   │   └── 11_upgrade_parts1155.ts   # Upgrade script
│   ├── abi/                          # Exported ABIs (auto-generated)
│   ├── out/addresses.json            # Contract addresses by network
│   └── package.json                  # Hardhat dependencies
├── src/onchain/                      # Frontend integration
│   ├── config.ts                     # Wagmi configuration
│   ├── addresses.ts                  # Contract addresses import
│   ├── abi.ts                        # ABI imports
│   └── MintGenesis.tsx               # Admin minting component
└── src/pages/MintGenesis.tsx         # Mint page wrapper
```

## Smart Contracts

### Holobots721A
- **Base**: ERC721A for efficient batch minting
- **Features**: ERC2981 royalties, AccessControl, UUPS upgradeable
- **Roles**: MINTER_ROLE, URI_SETTER_ROLE, UPGRADER_ROLE
- **Functions**: `mint()`, `mintBatch()`, `adminMint()`

### Parts1155  
- **Base**: ERC1155 for multi-token support
- **Features**: ERC2981 royalties, AccessControl, UUPS upgradeable
- **Roles**: MINTER_ROLE, URI_SETTER_ROLE, UPGRADER_ROLE
- **Functions**: `mint()`, `mintBatch()`

## Networks

- **Base Sepolia** (testnet): Primary deployment target
- **Base Mainnet**: Production deployment target
- **Basescan**: Contract verification

## Deployment

### Prerequisites
```bash
# In onchain/ directory
npm install

# Set environment variables
cp .env.example .env
# Configure: PRIVATE_KEY, BASESCAN_API_KEY, etc.
```

### Deploy to Base Sepolia
```bash
cd onchain/
npm run deploy:sepolia
```

### Deploy to Base Mainnet
```bash
cd onchain/
npm run deploy:base
```

### Upgrade Contracts
```bash
# Set proxy addresses in environment
export HOLOBOTS_PROXY=0x...
export PARTS_PROXY=0x...

npm run upgrade:sepolia  # or upgrade:base
```

## Frontend Integration

### Components
- **MintGenesis**: Admin-only minting interface
- **Route**: `/mint-genesis` (no auth required for admin testing)

### Features
- Wallet connection with Wagmi
- Network validation (Base Sepolia)
- Transaction status tracking
- Basescan links for verification
- Responsive design with loading states

### Usage
1. Visit `/mint-genesis`
2. Connect wallet (MetaMask, etc.)
3. Switch to Base Sepolia network
4. Enter recipient address (optional)
5. Set quantity (1-10)
6. Mint Genesis Holobot

## Key Files Created/Modified

### New Files
- `onchain/` - Complete Hardhat project
- `src/onchain/` - Frontend integration layer  
- `src/pages/MintGenesis.tsx` - Mint page
- `ONCHAIN_IMPLEMENTATION.md` - This documentation

### Modified Files  
- `src/App.tsx` - Added `/mint-genesis` route
- `package.json` - Dependencies already included

## Architecture Decisions

1. **Git Submodule**: Contracts separated for independent development
2. **UUPS Proxies**: Upgradeable contracts for future improvements  
3. **Role-based Access**: Granular permissions for different operations
4. **Wagmi Integration**: Modern Web3 React hooks
5. **Base Chain**: Lower gas costs, Ethereum compatibility

## Post-Deploy Checklist

- [ ] Deploy contracts to Base Sepolia
- [ ] Update `onchain/out/addresses.json` with real addresses
- [ ] Grant MINTER_ROLE to intended admin wallets
- [ ] Verify contracts on Basescan
- [ ] Test admin minting functionality
- [ ] Set up monitoring for contract events
- [ ] Plan batch mint for early supporters

## Next Steps

1. **Production Deploy**: Move to Base mainnet
2. **Role Management**: Set up proper admin multi-sig
3. **Metadata**: Configure IPFS/Arweave for NFT metadata
4. **Integration**: Wire Genesis NFTs into existing game logic
5. **Marketplace**: Enable trading via OpenSea/LooksRare

## Security Notes

- Contracts use OpenZeppelin's battle-tested implementations
- UUPS upgradeability requires UPGRADER_ROLE for upgrades
- AccessControl provides granular permission management
- Frontend validates network and wallet connection
- All transactions require user confirmation

## Support

For deployment issues or questions:
1. Check contract addresses in `onchain/out/addresses.json`
2. Verify network configuration in `hardhat.config.ts`
3. Ensure environment variables are properly set
4. Test with small amounts first on testnet

---

*Built with ❤️ for the Holobots community*
