#!/usr/bin/env node

/**
 * Data Migration Script: Supabase to Firebase
 * 
 * This script migrates data from Supabase (PostgreSQL) to Firebase (Firestore).
 * It reads exported JSON files and pushes records to Firestore, preserving IDs.
 * 
 * Usage:
 *   1. Export your Supabase data to JSON files (profiles.json, holobots.json)
 *   2. Place the JSON files in the same directory as this script
 *   3. Set up Firebase service account credentials
 *   4. Run: node migrate-to-firebase.js
 * 
 * Prerequisites:
 *   - npm install firebase-admin
 *   - Firebase service account JSON file (download from Firebase Console)
 *   - Exported JSON data from Supabase
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Path to your Firebase service account key JSON file
  // Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',
  
  // Paths to exported Supabase data
  profilesJsonPath: process.env.PROFILES_JSON_PATH || './profiles.json',
  holobotsJsonPath: process.env.HOLOBOTS_JSON_PATH || './holobots.json',
  
  // Firestore collection names
  collections: {
    users: 'users',
    bots: 'bots',
  },
  
  // Batch size for Firestore writes (max 500)
  batchSize: 400,
};

// Initialize Firebase Admin SDK
function initializeFirebase() {
  console.log('Initializing Firebase Admin SDK...');
  
  const serviceAccountPath = path.resolve(__dirname, CONFIG.serviceAccountPath);
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Error: Service account file not found at ${serviceAccountPath}`);
    console.error('\nTo set up Firebase Admin:');
    console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save the JSON file as "firebase-service-account.json" in the scripts folder');
    console.error('\nAlternatively, set FIREBASE_SERVICE_ACCOUNT_PATH environment variable.');
    process.exit(1);
  }
  
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('Firebase Admin SDK initialized successfully');
  return admin.firestore();
}

// Read JSON file
function readJsonFile(filePath) {
  const resolvedPath = path.resolve(__dirname, filePath);
  
  if (!fs.existsSync(resolvedPath)) {
    console.warn(`Warning: File not found at ${resolvedPath}`);
    return null;
  }
  
  try {
    const data = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Convert Supabase snake_case to Firestore camelCase
function convertProfileToFirestore(supabaseProfile) {
  return {
    username: supabaseProfile.username || `user_${supabaseProfile.id.slice(0, 8)}`,
    email: supabaseProfile.email || null,
    walletAddress: supabaseProfile.wallet_address || null,
    dailyEnergy: supabaseProfile.daily_energy ?? 100,
    maxDailyEnergy: supabaseProfile.max_daily_energy ?? 100,
    holosTokens: supabaseProfile.holos_tokens ?? 0,
    gachaTickets: supabaseProfile.gacha_tickets ?? 0,
    wins: supabaseProfile.wins ?? 0,
    losses: supabaseProfile.losses ?? 0,
    arenaPassses: supabaseProfile.arena_passes ?? 0,
    expBoosters: supabaseProfile.exp_boosters ?? 0,
    energyRefills: supabaseProfile.energy_refills ?? 0,
    rankSkips: supabaseProfile.rank_skips ?? 0,
    asyncBattleTickets: supabaseProfile.async_battle_tickets ?? 3,
    playerRank: supabaseProfile.player_rank || 'Rookie',
    blueprints: supabaseProfile.blueprints || {},
    parts: supabaseProfile.parts || [],
    equippedParts: supabaseProfile.equipped_parts || {},
    holobots: supabaseProfile.holobots || [],
    syncPoints: supabaseProfile.sync_points ?? 0,
    prestigeCount: supabaseProfile.prestige_count ?? 0,
    isDevAccount: supabaseProfile.is_dev_account ?? false,
    inventory: supabaseProfile.inventory || { common: 0, rare: 0, legendary: 0 },
    packHistory: supabaseProfile.pack_history || [],
    rewardSystem: supabaseProfile.reward_system || null,
    createdAt: supabaseProfile.created_at 
      ? admin.firestore.Timestamp.fromDate(new Date(supabaseProfile.created_at))
      : admin.firestore.FieldValue.serverTimestamp(),
    lastEnergyRefresh: supabaseProfile.last_energy_refresh
      ? admin.firestore.Timestamp.fromDate(new Date(supabaseProfile.last_energy_refresh))
      : admin.firestore.FieldValue.serverTimestamp(),
    lastDailyPull: supabaseProfile.last_daily_pull
      ? admin.firestore.Timestamp.fromDate(new Date(supabaseProfile.last_daily_pull))
      : null,
    lastAsyncTicketRefresh: supabaseProfile.last_async_ticket_refresh
      ? admin.firestore.Timestamp.fromDate(new Date(supabaseProfile.last_async_ticket_refresh))
      : admin.firestore.FieldValue.serverTimestamp(),
  };
}

// Convert Supabase holobot to Firestore format
function convertHolobotToFirestore(supabaseHolobot) {
  return {
    name: supabaseHolobot.name,
    level: supabaseHolobot.level ?? 1,
    rank: supabaseHolobot.rank ?? 1,
    attributes: supabaseHolobot.attributes || {},
    ownerId: supabaseHolobot.owner_id,
    parts: supabaseHolobot.parts ?? null,
    createdAt: supabaseHolobot.created_at
      ? admin.firestore.Timestamp.fromDate(new Date(supabaseHolobot.created_at))
      : admin.firestore.FieldValue.serverTimestamp(),
  };
}

// Migrate profiles to users collection
async function migrateProfiles(db, profiles) {
  if (!profiles || profiles.length === 0) {
    console.log('No profiles to migrate');
    return { success: 0, failed: 0 };
  }
  
  console.log(`\nMigrating ${profiles.length} profiles to users collection...`);
  
  let success = 0;
  let failed = 0;
  
  // Process in batches
  for (let i = 0; i < profiles.length; i += CONFIG.batchSize) {
    const batch = db.batch();
    const batchProfiles = profiles.slice(i, i + CONFIG.batchSize);
    
    for (const profile of batchProfiles) {
      try {
        const firestoreData = convertProfileToFirestore(profile);
        const docRef = db.collection(CONFIG.collections.users).doc(profile.id);
        batch.set(docRef, firestoreData, { merge: true });
      } catch (error) {
        console.error(`Error preparing profile ${profile.id}:`, error.message);
        failed++;
      }
    }
    
    try {
      await batch.commit();
      success += batchProfiles.length;
      console.log(`  Batch ${Math.floor(i / CONFIG.batchSize) + 1}: Migrated ${batchProfiles.length} profiles`);
    } catch (error) {
      console.error(`  Batch ${Math.floor(i / CONFIG.batchSize) + 1} failed:`, error.message);
      failed += batchProfiles.length;
    }
  }
  
  return { success, failed };
}

// Migrate holobots to bots collection (if separate collection needed)
async function migrateHolobots(db, holobots) {
  if (!holobots || holobots.length === 0) {
    console.log('No holobots to migrate (or holobots are nested in profiles)');
    return { success: 0, failed: 0 };
  }
  
  console.log(`\nMigrating ${holobots.length} holobots to bots collection...`);
  
  let success = 0;
  let failed = 0;
  
  // Process in batches
  for (let i = 0; i < holobots.length; i += CONFIG.batchSize) {
    const batch = db.batch();
    const batchHolobots = holobots.slice(i, i + CONFIG.batchSize);
    
    for (const holobot of batchHolobots) {
      try {
        const firestoreData = convertHolobotToFirestore(holobot);
        const docRef = db.collection(CONFIG.collections.bots).doc(String(holobot.id));
        batch.set(docRef, firestoreData, { merge: true });
      } catch (error) {
        console.error(`Error preparing holobot ${holobot.id}:`, error.message);
        failed++;
      }
    }
    
    try {
      await batch.commit();
      success += batchHolobots.length;
      console.log(`  Batch ${Math.floor(i / CONFIG.batchSize) + 1}: Migrated ${batchHolobots.length} holobots`);
    } catch (error) {
      console.error(`  Batch ${Math.floor(i / CONFIG.batchSize) + 1} failed:`, error.message);
      failed += batchHolobots.length;
    }
  }
  
  return { success, failed };
}

// Main migration function
async function main() {
  console.log('====================================');
  console.log('Supabase to Firebase Data Migration');
  console.log('====================================\n');
  
  // Initialize Firebase
  const db = initializeFirebase();
  
  // Read exported data
  console.log('\nReading exported data...');
  const profiles = readJsonFile(CONFIG.profilesJsonPath);
  const holobots = readJsonFile(CONFIG.holobotsJsonPath);
  
  console.log(`  Profiles found: ${profiles ? profiles.length : 0}`);
  console.log(`  Holobots found: ${holobots ? holobots.length : 0}`);
  
  if (!profiles && !holobots) {
    console.error('\nNo data files found. Please export your Supabase data first.');
    console.error('\nTo export from Supabase:');
    console.error('1. Go to Supabase Dashboard > Table Editor');
    console.error('2. Select the table (profiles, holobots)');
    console.error('3. Click "Export" and choose JSON format');
    console.error('4. Save as profiles.json and holobots.json in the scripts folder');
    process.exit(1);
  }
  
  // Migrate data
  const results = {
    profiles: { success: 0, failed: 0 },
    holobots: { success: 0, failed: 0 },
  };
  
  if (profiles) {
    results.profiles = await migrateProfiles(db, profiles);
  }
  
  if (holobots) {
    results.holobots = await migrateHolobots(db, holobots);
  }
  
  // Print summary
  console.log('\n====================================');
  console.log('Migration Summary');
  console.log('====================================');
  console.log(`Profiles: ${results.profiles.success} success, ${results.profiles.failed} failed`);
  console.log(`Holobots: ${results.holobots.success} success, ${results.holobots.failed} failed`);
  
  const totalSuccess = results.profiles.success + results.holobots.success;
  const totalFailed = results.profiles.failed + results.holobots.failed;
  
  console.log(`\nTotal: ${totalSuccess} success, ${totalFailed} failed`);
  
  if (totalFailed > 0) {
    console.log('\nSome records failed to migrate. Check the logs above for details.');
    process.exit(1);
  }
  
  console.log('\nMigration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify data in Firebase Console');
  console.log('2. Update your app to use Firebase');
  console.log('3. Test all functionality');
  console.log('4. Deprecate Supabase when ready');
  
  process.exit(0);
}

// Run migration
main().catch((error) => {
  console.error('\nMigration failed with error:', error);
  process.exit(1);
});
