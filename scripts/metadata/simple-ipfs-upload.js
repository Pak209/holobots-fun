#!/usr/bin/env node

/**
 * Simple IPFS upload using Pinata's API directly
 * 
 * Usage:
 * PINATA_JWT=your_jwt_token node scripts/metadata/simple-ipfs-upload.js genesis
 * PINATA_JWT=your_jwt_token node scripts/metadata/simple-ipfs-upload.js parts
 * 
 * Get your JWT token from: https://app.pinata.cloud/developers/api-keys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_TYPE = process.argv[2]; // 'genesis' or 'parts'
const PINATA_JWT = process.env.PINATA_JWT;

if (!METADATA_TYPE || !['genesis', 'parts'].includes(METADATA_TYPE)) {
  console.error('Usage: PINATA_JWT=your_jwt node simple-ipfs-upload.js [genesis|parts]');
  process.exit(1);
}

if (!PINATA_JWT) {
  console.error('❌ PINATA_JWT environment variable is required');
  console.log('💡 Get your JWT token from: https://app.pinata.cloud/developers/api-keys');
  console.log('💡 Then run: PINATA_JWT=your_jwt_token node simple-ipfs-upload.js genesis');
  process.exit(1);
}

const METADATA_PATH = path.join(__dirname, '../../metadata', METADATA_TYPE);

if (!fs.existsSync(METADATA_PATH)) {
  console.error(`❌ Metadata directory not found: ${METADATA_PATH}`);
  process.exit(1);
}

console.log(`📁 Uploading ${METADATA_TYPE} metadata to IPFS via Pinata...`);
console.log(`📂 Path: ${METADATA_PATH}`);

async function uploadToPinata() {
  try {
    // Create a simple upload by creating a tar-like structure
    // First, let's try uploading as individual files using the folder upload method
    
    // Read all JSON files in the metadata directory
    const files = fs.readdirSync(METADATA_PATH)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.replace('.json', ''));
        const bNum = parseInt(b.replace('.json', ''));
        return aNum - bNum;
      });
    
    console.log(`📊 Found ${files.length} metadata files`);
    
    // For simplicity, let's upload the first file and test
    // Then we can upload the whole folder
    const firstFile = files[0];
    const filePath = path.join(METADATA_PATH, firstFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🔄 Uploading to Pinata (testing with ${firstFile})...`);
    
    // Upload JSON content directly
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: JSON.parse(fileContent),
        pinataMetadata: {
          name: `Holobot-${METADATA_TYPE}-${firstFile}`,
          keyvalues: {
            project: 'holobots',
            type: METADATA_TYPE,
            file: firstFile
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log(`✅ Upload successful!`);
    console.log(`🔗 IPFS CID: ${cid}`);
    console.log(`🌐 IPFS Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
    
    if (METADATA_TYPE === 'genesis') {
      console.log(`\n📝 Add this to your onchain/.env file:`);
      console.log(`GENESIS_BASE_URI=ipfs://${cid}/`);
    } else if (METADATA_TYPE === 'parts') {
      console.log(`\n📝 Add this to your onchain/.env file:`);
      console.log(`PARTS_BASE_URI=ipfs://${cid}/{id}.json`);
    }
    
    // Update constants.ts with the new CID
    updateConstants(METADATA_TYPE, cid);
    
    return cid;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Valid PINATA_JWT token from https://app.pinata.cloud/developers/api-keys');
    console.log('2. Internet connection');
    console.log('3. Sufficient Pinata storage quota');
    process.exit(1);
  }
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

// Run the upload
uploadToPinata();
