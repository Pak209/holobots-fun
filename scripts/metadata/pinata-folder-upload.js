#!/usr/bin/env node

/**
 * Upload metadata folder to IPFS using Pinata
 * This creates a proper folder structure that works with ERC-721A and ERC-1155
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_TYPE = process.argv[2]; // 'genesis' or 'parts'
const PINATA_JWT = process.env.PINATA_JWT;

if (!METADATA_TYPE || !['genesis', 'parts'].includes(METADATA_TYPE)) {
  console.error('Usage: PINATA_JWT=your_jwt node pinata-folder-upload.js [genesis|parts]');
  process.exit(1);
}

if (!PINATA_JWT) {
  console.error('❌ PINATA_JWT environment variable is required');
  console.log('💡 Get your JWT token from: https://app.pinata.cloud/developers/api-keys');
  process.exit(1);
}

const METADATA_PATH = path.join(__dirname, '../../metadata', METADATA_TYPE);

async function uploadFolderToPinata() {
  try {
    console.log(`📁 Uploading ${METADATA_TYPE} metadata folder to IPFS...`);
    console.log(`📂 Path: ${METADATA_PATH}`);
    
    // Read all JSON files
    const files = fs.readdirSync(METADATA_PATH)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.replace('.json', ''));
        const bNum = parseInt(b.replace('.json', ''));
        return aNum - bNum;
      });
    
    console.log(`📊 Found ${files.length} metadata files: ${files.join(', ')}`);
    
    // Create form data for folder upload
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    
    // Add each file to the form with proper path structure
    for (const file of files) {
      const filePath = path.join(METADATA_PATH, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Add file with its name as the path in IPFS
      form.append('file', fileBuffer, {
        filename: file,
        contentType: 'application/json',
        // This creates the file structure in IPFS
        filepath: file
      });
    }
    
    // Add Pinata metadata
    form.append('pinataMetadata', JSON.stringify({
      name: `holobot-${METADATA_TYPE}-metadata`,
      keyvalues: {
        project: 'holobots',
        type: METADATA_TYPE,
        count: files.length.toString()
      }
    }));
    
    // Add Pinata options
    form.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: true  // This creates a proper folder structure
    }));
    
    console.log(`🔄 Uploading ${files.length} files to Pinata...`);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log(`✅ Upload successful!`);
    console.log(`🔗 IPFS CID: ${cid}`);
    console.log(`🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/${cid}`);
    
    // Test access to individual files
    console.log(`\n🔍 Testing file access:`);
    for (const file of files.slice(0, 2)) { // Test first 2 files
      const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}/${file}`;
      console.log(`📄 ${file}: ${fileUrl}`);
    }
    
    if (METADATA_TYPE === 'genesis') {
      console.log(`\n📝 Add this to your onchain/.env file:`);
      console.log(`GENESIS_BASE_URI=ipfs://${cid}/`);
      console.log(`\n🔗 Test URL for token 0: https://gateway.pinata.cloud/ipfs/${cid}/0.json`);
    } else if (METADATA_TYPE === 'parts') {
      console.log(`\n📝 Add this to your onchain/.env file:`);
      console.log(`PARTS_BASE_URI=ipfs://${cid}/{id}.json`);
      console.log(`\n🔗 Test URL for part 1: https://gateway.pinata.cloud/ipfs/${cid}/1.json`);
    }
    
    return cid;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Valid PINATA_JWT token');
    console.log('2. Internet connection');
    console.log('3. Sufficient Pinata storage quota');
    process.exit(1);
  }
}

uploadFolderToPinata();
