#!/usr/bin/env node

/**
 * Firebase Auth Import Script
 * 
 * Imports Supabase auth users into Firebase Auth while preserving:
 * - User IDs (so they match Firestore data)
 * - Passwords (bcrypt hashes)
 * - Email addresses and verification status
 * 
 * Usage: node import-auth-users.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',
  csvPath: process.env.AUTH_CSV_PATH || './supabase-auth-users.csv',
};

// Initialize Firebase Admin SDK
function initializeFirebase() {
  console.log('Initializing Firebase Admin SDK...');
  
  const serviceAccountPath = path.resolve(__dirname, CONFIG.serviceAccountPath);
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Error: Service account file not found at ${serviceAccountPath}`);
    process.exit(1);
  }
  
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('Firebase Admin SDK initialized successfully\n');
  return admin.auth();
}

// Parse CSV file
function parseCSV(filePath) {
  const csvPath = path.resolve(__dirname, filePath);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }
  
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  const users = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields with commas and escaped quotes)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];
      
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        j++; // Skip next quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    const user = {};
    headers.forEach((header, index) => {
      let value = values[index] ? values[index].trim() : null;
      // Remove surrounding quotes if present
      if (value && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      user[header.trim()] = value;
    });
    
    users.push(user);
  }
  
  return users;
}

// Convert Supabase user to Firebase import format
function convertToFirebaseUser(supabaseUser) {
  try {
    // Parse raw_user_meta_data JSON
    let metadata = {};
    if (supabaseUser.raw_user_meta_data) {
      metadata = JSON.parse(supabaseUser.raw_user_meta_data);
    }
    
    const firebaseUser = {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      emailVerified: supabaseUser.email_confirmed_at !== 'null' && supabaseUser.email_confirmed_at !== null,
      passwordHash: Buffer.from(supabaseUser.encrypted_password),
      displayName: metadata.username || null,
      metadata: {
        creationTime: new Date(supabaseUser.created_at).toISOString(),
        lastSignInTime: new Date(supabaseUser.updated_at).toISOString(),
      },
      customClaims: {
        username: metadata.username || null,
      },
    };
    
    return firebaseUser;
  } catch (error) {
    console.error(`Error converting user ${supabaseUser.email}:`, error.message);
    return null;
  }
}

// Import users to Firebase Auth
async function importUsers(auth, users) {
  console.log(`Preparing to import ${users.length} users...\n`);
  
  const firebaseUsers = users
    .map(convertToFirebaseUser)
    .filter(user => user !== null);
  
  console.log(`Successfully converted ${firebaseUsers.length} users\n`);
  
  // Firebase Auth import options for bcrypt
  const options = {
    hash: {
      algorithm: 'BCRYPT',
    },
  };
  
  try {
    const result = await auth.importUsers(firebaseUsers, options);
    
    console.log('====================================');
    console.log('Import Results');
    console.log('====================================');
    console.log(`Successfully imported: ${result.successCount} users`);
    console.log(`Failed to import: ${result.failureCount} users\n`);
    
    if (result.failureCount > 0) {
      console.log('Errors:');
      result.errors.forEach((error, index) => {
        console.log(`  User ${index}: ${error.error.message}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error importing users:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('====================================');
  console.log('Firebase Auth Import');
  console.log('====================================\n');
  
  // Initialize Firebase
  const auth = initializeFirebase();
  
  // Parse CSV
  console.log('Reading CSV file...');
  const users = parseCSV(CONFIG.csvPath);
  console.log(`Found ${users.length} users in CSV\n`);
  
  // Import users
  const result = await importUsers(auth, users);
  
  console.log('\n====================================');
  console.log('Import Complete!');
  console.log('====================================');
  console.log('\nNext steps:');
  console.log('1. Verify users in Firebase Console');
  console.log('2. Try logging in with your original credentials');
  console.log('3. Your data should be automatically loaded from Firestore\n');
  
  if (result.successCount === users.length) {
    console.log('✅ All users imported successfully!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some users failed to import. Check errors above.\n');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('\nImport failed:', error);
  process.exit(1);
});
