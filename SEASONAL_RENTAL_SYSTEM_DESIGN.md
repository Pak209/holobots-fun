# 🎮 Seasonal Rental System Architecture

## 📊 Current Blueprint System Analysis

### Current Flow:
1. **Collection**: Players earn blueprint pieces through:
   - Arena battles (30% chance, scaling with performance)
   - Boss quests (5-15 pieces per completion)
   - Booster pack openings (3-10 pieces based on tier)
   - Marketplace purchases (Holos tokens)

2. **Redemption**: Players use blueprint pieces to create Holobots:
   - **Common**: 3 pieces → Level 1 Holobot
   - **Champion**: 5 pieces → Level 3 Holobot  
   - **Rare**: 8 pieces → Level 5 Holobot
   - **Elite**: 12 pieces → Level 7 Holobot
   - **Legendary**: 20 pieces → Level 10 Holobot

3. **Storage**: Holobots stored in user profile (`UserProfile.holobots[]`)

## 🔄 New Seasonal Rental System

### Core Concept:
Convert blueprints → **Seasonal Rental Tokens** that expire and can be converted to permanent NFTs

### 🏗️ System Architecture

```typescript
interface SeasonalRentalHolobot {
  id: string;
  holobotKey: string;
  name: string;
  tier: 'common' | 'champion' | 'rare' | 'elite' | 'legendary';
  level: number;
  experience: number;
  seasonId: string;
  rentalExpiryDate: string; // ISO timestamp
  isExpired: boolean;
  canMintToNFT: boolean;
  mintPricing: {
    usdc: number;     // $5-125 based on tier
    eth: number;      // ETH equivalent
    holos: number;    // 20% discount with Holos
  };
  discounts: {
    playerRank: number;    // Up to 30% based on player rank
    stockpileStake: number; // 25% if staking in Stockpile
    questBonus: number;     // $5-10 bonus from quests
    holosPayment: number;   // 20% for using Holos token
  };
}

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  rentalDuration: number; // days (e.g., 90 days)
  isActive: boolean;
  conversionEnabled: boolean;
}
```

### 🎯 Rental System Features

#### 1. **Seasonal Rental Creation**
- Players use blueprint pieces to create **temporary rental Holobots**
- Rentals last for the season duration (e.g., 90 days)
- Same tier requirements as current system (3-20 pieces)

#### 2. **Rental Lifecycle**
```typescript
// Rental States
enum RentalState {
  ACTIVE = 'active',           // Can use in battles/quests
  EXPIRING = 'expiring',       // 7 days until expiry
  EXPIRED = 'expired',         // Cannot use, can convert or lose
  CONVERTED = 'converted'      // Minted to NFT
}
```

#### 3. **Expiry Management**
- **Grace Period**: 7 days warning before expiry
- **Options at Expiry**:
  - Convert to NFT (with pricing)
  - Extend rental (additional blueprint pieces)
  - Lose the Holobot (free-to-play option)

### 💰 Mint-to-NFT Pricing System

#### Base Pricing (from RentalConversionManager.sol):
```typescript
const TIER_PRICING = {
  COMMON: { usd: 5, holos: 500 },
  CHAMPION: { usd: 15, holos: 1500 },
  RARE: { usd: 35, holos: 3500 },
  ELITE: { usd: 75, holos: 7500 },
  LEGENDARY: { usd: 125, holos: 12500 }
};
```

#### Discount Stacking:
1. **Player Rank Discount**: 0-30% based on player level
2. **Stockpile Stake Discount**: 25% if user stakes in Stockpile contract
3. **Quest Bonus**: $5-10 reduction from quest achievements
4. **Holos Payment Discount**: 20% when paying with Holos tokens

#### Payment Options:
- **USDC**: Standard pricing
- **ETH**: Oracle-updated pricing
- **HOLOS**: 20% discount + token sink (50% Treasury, 50% Stockpile)

### 🔧 Technical Implementation

#### 1. **Database Schema Updates**

```sql
-- Add to existing user profiles
ALTER TABLE profiles ADD COLUMN rental_holobots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN current_season_id VARCHAR(50);

-- New tables
CREATE TABLE seasons (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rental_duration_days INTEGER DEFAULT 90,
    is_active BOOLEAN DEFAULT false,
    conversion_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rental_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    rental_id VARCHAR(100) NOT NULL,
    holobot_key VARCHAR(50) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'usdc', 'eth', 'holos'
    base_price_usd DECIMAL(10,2) NOT NULL,
    discount_amount_usd DECIMAL(10,2) DEFAULT 0,
    final_price_usd DECIMAL(10,2) NOT NULL,
    transaction_hash VARCHAR(100),
    nft_token_id INTEGER,
    converted_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **Smart Contract Integration**

**Connect to existing Holos ecosystem contracts:**
- **RentalConversionManager**: Handle NFT minting with discounts
- **HolosToken**: Payment processing and token sink
- **Treasury & Stockpile**: Revenue distribution
- **Parts1155**: Our deployed contract for parts/accessories

#### 3. **Frontend Components**

```typescript
// New components needed:
- <SeasonalRentalCard /> - Display rental Holobot with expiry
- <ConversionPricingModal /> - Show pricing options and discounts  
- <SeasonTimer /> - Countdown to season end
- <RentalStatusBadge /> - Active/Expiring/Expired indicators
- <PaymentMethodSelector /> - USDC/ETH/HOLOS options
```

### 🎮 Game Economy Impact

#### Benefits:
1. **Monetization**: Converting free players to paid through rental pressure
2. **Token Sink**: Holos payment creates deflationary pressure
3. **Engagement**: Time pressure keeps players active
4. **Premium Feel**: NFT ownership becomes more valuable

#### Player Journey:
1. **Free Play**: Collect blueprints → Create rental Holobots
2. **Engagement**: Use rentals in battles/quests for 90 days
3. **Decision Point**: Convert to NFT or lose Holobot
4. **Conversion**: Pay $5-125 based on tier and discounts
5. **Ownership**: Permanent NFT with full trading/staking benefits

### 📅 Implementation Phases

#### Phase 1: Core Rental System (2 weeks)
- [ ] Database schema updates
- [ ] Rental creation from blueprints
- [ ] Expiry tracking and warnings
- [ ] Basic UI for rental management

#### Phase 2: Payment Integration (1 week)  
- [ ] Connect to RentalConversionManager contract
- [ ] USDC/ETH/HOLOS payment flows
- [ ] Discount calculation system
- [ ] Transaction confirmation

#### Phase 3: Enhanced Features (1 week)
- [ ] Player rank discount system
- [ ] Stockpile integration for staking discounts
- [ ] Quest bonus system
- [ ] Advanced analytics and reporting

### 🔄 Migration Strategy

#### Existing Players:
1. **Blueprint Conversion**: Current blueprint pieces → Season 1 rental tokens
2. **Existing Holobots**: Convert to permanent rentals for Season 1
3. **Grandfathering**: Give existing players special discounts/benefits

#### Communication:
1. **Announcement**: 2 weeks before Season 1 launch
2. **Tutorial**: In-game guide explaining new system
3. **Benefits**: Highlight NFT ownership advantages

## 🎯 Success Metrics

- **Conversion Rate**: % of rental users who mint to NFT
- **Revenue per User**: Average spending on conversions
- **Retention**: Player activity during rental periods
- **Token Sink**: Amount of Holos burned through conversions

---

**This system maintains the free-to-play nature while creating natural monetization points and increasing the value of NFT ownership.**
