# 🎮 Holos Integration Setup Guide

## 📋 Environment Variables

Add these to your `.env` file to integrate with the Holos ecosystem:

```bash
# Holos Ecosystem Contract Addresses (to be deployed)
VITE_HOLOS_TOKEN_ADDRESS=
VITE_RENTAL_CONVERSION_MANAGER_ADDRESS=
VITE_TREASURY_ADDRESS=
VITE_STOCKPILE_ADDRESS=
VITE_GENESIS_NFT_MINTER_ADDRESS=
VITE_SEASON1_NFT_ADDRESS=

# Seasonal Rental System Configuration
VITE_SEASON_ID=season1
VITE_RENTAL_DURATION_DAYS=90
VITE_CONVERSION_ENABLED=true
```

## 🚀 Next Steps

### 1. Deploy Holos Contracts

Navigate to the Holos contracts directory and deploy:

```bash
cd contracts/holos
npm install
npm run deploy:sepolia
```

### 2. Update Environment Variables

After deployment, update your `.env` with the deployed contract addresses.

### 3. Test Integration

Run the development server to test the integration:

```bash
npm run dev
```

## 📁 New Components Added

### Core Integration
- `/src/integrations/holos/` - Core Holos integration
- `/src/hooks/useRentalConversion.ts` - Conversion hook
- `/src/components/rental/` - Rental UI components

### Key Features Implemented

1. **Seasonal Rental System**
   - Convert blueprints to temporary rentals
   - 90-day expiry with warnings
   - Mint-to-NFT conversion options

2. **Pricing System**
   - Tier-based pricing ($5-$125)
   - Discount stacking (rank, staking, quests)
   - Multi-currency support (USDC, ETH, HOLOS)

3. **UI Components**
   - `<SeasonalRentalCard />` - Display rental status
   - `<ConversionPricingModal />` - Pricing and payment
   - Payment method selection
   - Discount breakdown

## 🔧 Integration Points

### Current System → Rental System

1. **Blueprint Collection** (No Change)
   - Arena battles still reward blueprint pieces
   - Quest completion gives blueprints
   - Marketplace purchases work the same

2. **Blueprint Redemption** (Modified)
   - Instead of permanent Holobots → Create seasonal rentals
   - Same tier requirements (3-20 pieces)
   - Rentals expire after 90 days

3. **New Conversion Flow**
   - Players can convert rentals to permanent NFTs
   - Payment in USDC, ETH, or HOLOS tokens
   - Discount system rewards engagement

## 💰 Revenue Model

### Free-to-Play Path
1. Collect blueprints through gameplay
2. Create rental Holobots (free)
3. Use for 90 days in battles/quests
4. Choose: Convert to NFT or lose

### Conversion Incentives
- **Time Pressure**: 7-day expiry warnings
- **Discounts**: Up to 50%+ off with stacking
- **HOLOS Utility**: 20% discount + token sink
- **Permanent Ownership**: Trading, staking, long-term value

## 🎯 Success Metrics

Track these KPIs:
- Rental creation rate
- Conversion rate (rental → NFT)
- Average revenue per user
- HOLOS token burn rate
- Player retention during rental periods

---

**The system is now ready for integration testing. Deploy the Holos contracts to start the full seasonal rental experience!** 🚀
