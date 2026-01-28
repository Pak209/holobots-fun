/**
 * Firebase Migration Script: Initialize Holobot Experience Fields
 * 
 * This script ensures all holobots have proper experience and level fields.
 * Run this once to fix existing holobots that are missing these fields.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase config (from your .env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function calculateExperience(level) {
  const baseExp = 100;
  const expMultiplier = 1.5;
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

async function fixHolobotExperience() {
  console.log('🔧 Starting Holobot Experience Migration...\n');
  
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);
  
  let totalUsers = 0;
  let totalHolobotsFixed = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    if (!userData.holobots || userData.holobots.length === 0) {
      continue;
    }
    
    totalUsers++;
    let needsUpdate = false;
    let updatedHolobots = userData.holobots.map(holobot => {
      const currentLevel = holobot.level || 1;
      const currentExp = holobot.experience || 0;
      const requiredNextLevel = holobot.nextLevelExp || calculateExperience(currentLevel + 1);
      
      // Check if holobot needs initialization
      if (holobot.experience === undefined || holobot.nextLevelExp === undefined) {
        needsUpdate = true;
        totalHolobotsFixed++;
        
        console.log(`  ✅ Fixing ${holobot.name} for user ${userDoc.id}:`);
        console.log(`     Level: ${currentLevel}`);
        console.log(`     Experience: ${currentExp} → ${currentExp || 0}`);
        console.log(`     Next Level EXP: ${requiredNextLevel}`);
        
        return {
          ...holobot,
          level: currentLevel,
          experience: currentExp || 0,
          nextLevelExp: calculateExperience(currentLevel + 1),
          boostedAttributes: holobot.boostedAttributes || {},
          attributePoints: holobot.attributePoints || 0
        };
      }
      
      // Check if experience exceeds requirement (needs level up)
      if (currentExp >= requiredNextLevel) {
        console.log(`  ⚠️  ${holobot.name} needs level up: ${currentExp}/${requiredNextLevel}`);
      }
      
      return holobot;
    });
    
    // Update user document if needed
    if (needsUpdate) {
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        holobots: updatedHolobots
      });
      console.log(`  💾 Updated user ${userDoc.id}\n`);
    }
  }
  
  console.log('\n✅ Migration Complete!');
  console.log(`   Users processed: ${totalUsers}`);
  console.log(`   Holobots fixed: ${totalHolobotsFixed}`);
}

// Run the migration
fixHolobotExperience()
  .then(() => {
    console.log('\n🎉 All done! Holobots should now level up correctly.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
