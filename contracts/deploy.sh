#!/bin/bash

# Deploy HolobotPublicMint to Base Sepolia
# Usage: PRIVATE_KEY=0x... ./contracts/deploy.sh

set -e

echo "🚀 Deploying HolobotPublicMint to Base Sepolia..."
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Usage: PRIVATE_KEY=0x... ./contracts/deploy.sh"
    exit 1
fi

# Set default BASE_URI if not provided
if [ -z "$BASE_URI" ]; then
    export BASE_URI="https://holobots.fun/api/metadata/"
fi

cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit 2>/dev/null || true

echo ""
echo "🔨 Compiling contracts..."
forge build

echo ""
echo "🚀 Deploying to Base Sepolia..."
echo "   BASE_URI: $BASE_URI"
echo ""

# Deploy using forge script
forge script Deploy.s.sol:DeployScript \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key "${BASESCAN_API_KEY:-2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ}" \
    -vvv

echo ""
echo "✅ Deployment complete!"
echo "📍 Check broadcast/Deploy.s.sol for the deployed address"
echo "🔗 Verify on BaseScan: https://sepolia.basescan.org"
