#!/bin/bash

# Simple deployment script for HolobotPublicMint
# Usage: PRIVATE_KEY=0x... ./deploy-simple.sh

set -e

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Usage: PRIVATE_KEY=0x... ./deploy-simple.sh"
    exit 1
fi

echo "🚀 Deploying HolobotPublicMint to Base Sepolia..."
echo ""

cd "$(dirname "$0")"

# Deploy using forge create (won't recompile everything)
forge create HolobotPublicMint \
  --rpc-url https://sepolia.base.org \
  --private-key "$PRIVATE_KEY" \
  --constructor-args "https://holobots.fun/api/metadata/" \
  --verify \
  --etherscan-api-key 2NTIMEQXXBRUMHDFND1NZDHZ9G69IJ1PXJ

echo ""
echo "✅ Deployment complete!"
echo "📝 Update src/lib/constants.ts with the deployed address above"
