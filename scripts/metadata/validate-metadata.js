#!/usr/bin/env node

/**
 * Validate NFT metadata structure for ERC-721A and ERC-1155 standards
 * 
 * Usage:
 * node scripts/metadata/validate-metadata.js genesis
 * node scripts/metadata/validate-metadata.js parts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_TYPE = process.argv[2]; // 'genesis' or 'parts'

if (!METADATA_TYPE || !['genesis', 'parts'].includes(METADATA_TYPE)) {
  console.error('Usage: node validate-metadata.js [genesis|parts]');
  process.exit(1);
}

const METADATA_PATH = path.join(__dirname, '../../metadata', METADATA_TYPE);

console.log(`🔍 Validating ${METADATA_TYPE} metadata...`);
console.log(`📂 Path: ${METADATA_PATH}`);

// Required fields for NFT metadata
const REQUIRED_FIELDS = ['name', 'description', 'image'];
const RECOMMENDED_FIELDS = ['external_url', 'attributes'];

function validateMetadataFile(filePath, tokenId) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(content);
    
    console.log(`\n📄 Validating ${path.basename(filePath)}...`);
    
    // Check required fields
    const missingRequired = REQUIRED_FIELDS.filter(field => !metadata[field]);
    if (missingRequired.length > 0) {
      console.error(`❌ Missing required fields: ${missingRequired.join(', ')}`);
      return false;
    }
    
    // Check recommended fields
    const missingRecommended = RECOMMENDED_FIELDS.filter(field => !metadata[field]);
    if (missingRecommended.length > 0) {
      console.warn(`⚠️  Missing recommended fields: ${missingRecommended.join(', ')}`);
    }
    
    // Validate specific fields
    if (METADATA_TYPE === 'genesis') {
      // For ERC-721A, check if name includes token ID
      if (!metadata.name.includes(`#${tokenId}`)) {
        console.warn(`⚠️  Name should include token ID #${tokenId}`);
      }
    }
    
    // Validate image URL
    if (!metadata.image.startsWith('ipfs://') && !metadata.image.startsWith('https://')) {
      console.warn(`⚠️  Image URL should use IPFS or HTTPS: ${metadata.image}`);
    }
    
    // Validate attributes structure
    if (metadata.attributes) {
      if (!Array.isArray(metadata.attributes)) {
        console.error(`❌ Attributes should be an array`);
        return false;
      }
      
      for (const attr of metadata.attributes) {
        if (!attr.trait_type || attr.value === undefined) {
          console.error(`❌ Invalid attribute structure: ${JSON.stringify(attr)}`);
          return false;
        }
      }
    }
    
    console.log(`✅ ${path.basename(filePath)} is valid`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error validating ${filePath}: ${error.message}`);
    return false;
  }
}

function validateMetadataStructure() {
  if (!fs.existsSync(METADATA_PATH)) {
    console.error(`❌ Metadata directory not found: ${METADATA_PATH}`);
    return false;
  }
  
  const files = fs.readdirSync(METADATA_PATH)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => {
      const aNum = parseInt(a.replace('.json', ''));
      const bNum = parseInt(b.replace('.json', ''));
      return aNum - bNum;
    });
  
  if (files.length === 0) {
    console.error(`❌ No JSON files found in ${METADATA_PATH}`);
    return false;
  }
  
  console.log(`📊 Found ${files.length} metadata files`);
  
  let allValid = true;
  
  for (const file of files) {
    const tokenId = parseInt(file.replace('.json', ''));
    const filePath = path.join(METADATA_PATH, file);
    
    if (!validateMetadataFile(filePath, tokenId)) {
      allValid = false;
    }
  }
  
  if (METADATA_TYPE === 'genesis') {
    // For ERC-721A, check sequential numbering starting from 0
    const expectedFiles = Array.from({length: files.length}, (_, i) => `${i}.json`);
    const missingFiles = expectedFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length > 0) {
      console.error(`❌ Missing sequential files for ERC-721A: ${missingFiles.join(', ')}`);
      allValid = false;
    }
  }
  
  return allValid;
}

function main() {
  const isValid = validateMetadataStructure();
  
  if (isValid) {
    console.log(`\n✅ All ${METADATA_TYPE} metadata files are valid!`);
    console.log(`\n🚀 Ready for IPFS upload!`);
    console.log(`Run: node scripts/metadata/upload-to-ipfs.js ${METADATA_TYPE}`);
  } else {
    console.log(`\n❌ Metadata validation failed. Please fix the issues above.`);
    process.exit(1);
  }
}

main();
