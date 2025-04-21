# Holobots PRD

## 1. Overview
Holobots is a fitness-enhanced, Web3-powered mech game where users train, upgrade, and battle Holobots—collectible NFT mechs. The Holobots mobile app complements the Dapp experience by enabling real-time activity tracking (step-based progression), automated battles, Holobot management, blueprint questing, and blockchain-based interactions.

## 🎯 2. Goals & Objectives
- Allow users to sync fitness data for earning Sync Points.
- Provide real-time battle logs and battle interaction (Hack system).
- Enable users to view, manage, and upgrade their Holobots.
- Include gacha pulls, quests, and blueprint crafting access.
- Integrate secure Web3 wallet login with Supabase auth.
- Enhance player immersion via push notifications, animations, and responsive UI.

## 📱 3. Core Features

### 3.1. Authentication & User Profiles
- Email/OAuth + Wallet login (Supabase auth + Web3 wallet connection).
- Persistent cross-platform login for mobile and Dapp.

### 3.2. Sync Points & Fitness Tracking
- Step tracking via HealthKit (iOS) and Google Fit (Android).
- 1,000 steps = 1 Sync Point.
- Daily quota and usage indicator shown.
- Fitness sync logs for transparency.

### 3.3. Holobot Management
- View Holobot roster with stats, rank, level, parts, and energy.
- Upgrade attributes using Sync Points and tokens.
- Equip parts and unlock special abilities.
- View Holobot prestige and rarity indicators.

### 3.4. Auto-Battles & Hack System
- Real-time, automated 1v1 battles with animation highlights.
- Interactive Hack button usable before the halfway mark to boost:
  - Health
  - Attribute (ATK/DEF/SPEED)
  - Special Attack Trigger
- Hack Meter + Special Meter charge through battle events.
- Post-battle reports with EXP, drops, and blueprint progress.

### 3.5. Blueprints, Quests & Gacha
- Quest Grid interface to send Holobots to themed zones (Meadow, Forest, etc.).
- Blueprint drop tracker for part assembly.
- Daily/weekly quests, PvE maps, and repair timers.
- Gacha machine (ticket + Holos payment) with animated pulls.

### 3.6. Marketplace & NFT Interactions (Phase 2)
- View and list Holobots and parts on internal marketplace.
- Mint new Holobots from collected parts.
- Stake Holobots for Holos farming (Legendary only).

### 3.7. Push Notifications
- Sync refill alerts.
- Quest completion & repair finished notifications.
- Blueprint crafting alerts.
- Token earnings or Stockpile drips (for Elite+ users).

### 3.8. Player Rank System
- Player Rank (Rookie → Legendary) based on Holobot roster.
- Rank badges, color codes, and rank progression meter.

## 🧠 4. Non-Functional Requirements
- Responsive UI (built with React Native or Swift/Compose).
- Works offline with cached data; resyncs when online.
- Web3-safe: wallet private keys are never stored.
- Low battery and bandwidth consumption during idle play.
- iOS and Android compatibility.

## 🛠 5. Tech Stack
- Frontend: React Native / Swift (Xcode)
- Backend: Supabase (Auth, DB, Buckets)
- Blockchain: EVM (Base), Solana (Holos token)
- APIs:
  - HealthKit & Google Fit
  - OpenBlock Labs (for Base rewards)
  - Quillopy for AI-guided UI consistency

## 📊 6. KPIs & Success Metrics
- Daily Active Users (DAU)
- Average Sync Points per user per week
- Number of battles fought
- Gacha pulls & blueprint completions
- User Rank distribution
- Time-to-Level statistics
- Retention Day 1 / 7 / 30 