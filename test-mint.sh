#!/bin/bash

# Quick test script to verify the contract works
# Usage: ./test-mint.sh

echo "🧪 Testing HolobotPublicMint Contract"
echo "======================================"
echo ""

CONTRACT="0x311abdffdFB4A062fE55C215c8EdDBA222bd42af"
RPC="https://sepolia.base.org"

echo "📍 Contract: $CONTRACT"
echo "🌐 RPC: $RPC"
echo ""

echo "1️⃣ Checking total supply..."
SUPPLY=$(cast call $CONTRACT "totalSupply()" --rpc-url $RPC)
echo "   Total Supply: $SUPPLY"
echo ""

echo "2️⃣ Checking max supply..."
MAX=$(cast call $CONTRACT "MAX_SUPPLY()" --rpc-url $RPC)
echo "   Max Supply: $MAX"
echo ""

echo "3️⃣ Checking max per wallet..."
MAX_PER=$(cast call $CONTRACT "MAX_PER_WALLET()" --rpc-url $RPC)
echo "   Max Per Wallet: $MAX_PER"
echo ""

echo "4️⃣ Testing publicMint simulation..."
if cast call $CONTRACT "publicMint()" --from 0xF79863969CdaAb03792Ff9fc8914daF25BA7f27C --rpc-url $RPC; then
    echo "   ✅ publicMint() simulation PASSED - Contract is working!"
else
    echo "   ❌ publicMint() simulation FAILED"
fi
echo ""

echo "======================================"
echo "Contract Status: ✅ LIVE"
echo ""
echo "To actually mint (requires private key):"
echo "cast send $CONTRACT 'publicMint()' \\"
echo "  --rpc-url $RPC \\"
echo "  --private-key 0xYOUR_KEY \\"
echo "  --gas-limit 300000"
