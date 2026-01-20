#!/usr/bin/env node

/**
 * Upload metadata to IPFS using Web3.Storage
 * 
 * Prerequisites:
 * 1. Install Web3.Storage CLI: npm install -g web3.storage
 * 2. Get API token from https://web3.storage
 * 3. Authenticate: w3 login [YOUR_EMAIL]
 * 
 * Usage:
 * node scripts/metadata/web3-storage-upload.js genesis
 * node scripts/metadata/web3-storage-upload.js parts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_TYPE = process.argv[2]; // 'genesis' or 'parts'

if (!METADATA_TYPE || !['genesis', 'parts'].includes(METADATA_TYPE)) {
  console.error('Usage: node web3-storage-upload.js [genesis|parts]');
  process.exit(1);
}

const METADATA_PATH = path.join(__dirname, '../../metadata', METADATA_TYPE);

if (!fs.existsSync(METADATA_PATH)) {
  console.error(`Metadata directory not found: ${METADATA_PATH}`);
  process.exit(1);
}

console.log(`📁 Uploading ${METADATA_TYPE} metadata to IPFS via Web3.Storage...`);
console.log(`📂 Path: ${METADATA_PATH}`);

try {
  // Upload to Web3.Storage
  const uploadCommand = `w3 up "${METADATA_PATH}" --name "Holobot-${METADATA_TYPE}-metadata"`;
  console.log(`🔄 Running: ${uploadCommand}`);
  
  const output = execSync(uploadCommand, { encoding: 'utf8' });
  console.log('✅ Upload successful!');
  console.log(output);
  
  // Extract CID from output (adjust based on Web3.Storage CLI output format)
  const cidMatch = output.match(/https:\/\/([a-zA-Z0-9]+)\.ipfs\.w3s\.link/);
  if (cidMatch) {
    const cid = cidMatch[1];
    console.log(`\n🔗 IPFS CID: ${cid}`);
    
    if (METADATA_TYPE === 'genesis') {
      console.log(`\n📝 Add this to your .env file:`);
      console.log(`VITE_GENESIS_BASE_URI=ipfs://${cid}/`);
    } else if (METADATA_TYPE === 'parts') {
      console.log(`\n📝 Add this to your .env file:`);
      console.log(`VITE_PARTS_BASE_URI=ipfs://${cid}/{id}.json`);
    }
    
    // Update constants.ts with the new CID
    updateConstants(METADATA_TYPE, cid);
  }
  
} catch (error) {
  console.error('❌ Upload failed:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('1. Installed Web3.Storage CLI: npm install -g web3.storage');
  console.log('2. Authenticated: w3 login [YOUR_EMAIL]');
  console.log('3. Check your internet connection');
  process.exit(1);
}

function updateConstants(metadataType, cid) {
  const constantsPath = path.join(__dirname, '../../src/lib/constants.ts');
  
  if (!fs.existsSync(constantsPath)) {
    console.log('⚠️  constants.ts not found, skipping auto-update');
    return;
  }
  
  try {
    let content = fs.readFileSync(constantsPath, 'utf8');
    
    if (metadataType === 'genesis') {
      content = content.replace(
        /GENESIS_BASE_URI: import\.meta\.env\.VITE_GENESIS_BASE_URI \|\| ".*?"/,
        `GENESIS_BASE_URI: import.meta.env.VITE_GENESIS_BASE_URI || "ipfs://${cid}/"`
      );
    } else if (metadataType === 'parts') {
      content = content.replace(
        /PARTS_BASE_URI: import\.meta\.env\.VITE_PARTS_BASE_URI \|\| ".*?"/,
        `PARTS_BASE_URI: import.meta.env.VITE_PARTS_BASE_URI || "ipfs://${cid}/{id}.json"`
      );
    }
    
    fs.writeFileSync(constantsPath, content);
    console.log('✅ Updated constants.ts with new IPFS CID');
    
  } catch (error) {
    console.log('⚠️  Failed to update constants.ts:', error.message);
  }
}
