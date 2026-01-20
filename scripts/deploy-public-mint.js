/**
 * Deploy HolobotPublicMint contract to Base Sepolia
 * Usage: PRIVATE_KEY=0x... node scripts/deploy-public-mint.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract bytecode and ABI will be compiled first
const CONTRACT_SOURCE = fs.readFileSync(
  path.join(__dirname, '../contracts/HolobotPublicMint.sol'),
  'utf8'
);

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BASE_URI = process.env.BASE_URI || 'https://holobots.fun/api/metadata/';

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY environment variable is required');
  console.error('Usage: PRIVATE_KEY=0x... node scripts/deploy-public-mint.js');
  process.exit(1);
}

async function main() {
  console.log('🚀 Deploying HolobotPublicMint to Base Sepolia...\n');

  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH\n');

  if (balance === 0n) {
    console.error('❌ Insufficient funds for deployment');
    process.exit(1);
  }

  // Contract bytecode (compiled Solidity)
  // This is a simplified version - in production you'd use a proper compiler
  const bytecode = await compileSolidity(CONTRACT_SOURCE);
  
  // Create contract factory
  const abi = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../src/abis/HolobotNFT_Public.json'),
    'utf8'
  ));

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log('📝 Deploying contract with BASE_URI:', BASE_URI);
  console.log('⏳ Waiting for deployment...\n');

  // Deploy contract
  const contract = await factory.deploy(BASE_URI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log('\n✅ Contract deployed successfully!');
  console.log('📍 Address:', address);
  console.log('🔗 BaseScan:', `https://sepolia.basescan.org/address/${address}`);

  // Update addresses file
  const addressesPath = path.join(__dirname, '../onchain/out/addresses.json');
  let addresses = {};
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  }
  
  addresses.HolobotPublicMint = address;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log('\n📄 Updated addresses.json');
  console.log('\n💡 Next step: Update src/lib/constants.ts with this address:');
  console.log(`   holobotNFT: "${address}",`);

  return address;
}

// Simplified Solidity compiler (requires solc)
async function compileSolidity(source) {
  console.log('⚠️  Note: This script requires solc to be installed');
  console.log('   Run: npm install -g solc');
  console.log('   Or use Remix deployment guide in contracts/DEPLOYMENT_GUIDE.md\n');
  
  // For now, we'll need to compile manually or use Remix
  throw new Error('Please compile the contract using Remix or run: forge build');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
