#!/bin/bash

# Upload metadata folder to Pinata IPFS
# Usage: PINATA_JWT=your_token bash upload-folder.sh genesis
# Usage: PINATA_JWT=your_token bash upload-folder.sh parts

set -e

METADATA_TYPE=$1
PINATA_JWT=${PINATA_JWT}

if [ -z "$METADATA_TYPE" ] || [ -z "$PINATA_JWT" ]; then
    echo "❌ Usage: PINATA_JWT=your_token bash upload-folder.sh [genesis|parts]"
    exit 1
fi

if [ "$METADATA_TYPE" != "genesis" ] && [ "$METADATA_TYPE" != "parts" ]; then
    echo "❌ METADATA_TYPE must be 'genesis' or 'parts'"
    exit 1
fi

METADATA_DIR="metadata/$METADATA_TYPE"

if [ ! -d "$METADATA_DIR" ]; then
    echo "❌ Directory $METADATA_DIR not found"
    exit 1
fi

echo "📁 Uploading $METADATA_TYPE metadata to IPFS..."
echo "📂 Directory: $METADATA_DIR"

# Count JSON files
FILE_COUNT=$(find "$METADATA_DIR" -name "*.json" | wc -l | tr -d ' ')
echo "📊 Found $FILE_COUNT JSON files"

# Create temporary directory for upload
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Copy all JSON files to temp directory
cp "$METADATA_DIR"/*.json "$TMP_DIR/"

echo "🔄 Uploading folder to Pinata..."

# Upload the entire directory
RESPONSE=$(curl -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
  -H "Authorization: Bearer $PINATA_JWT" \
  -F "file=@$TMP_DIR/0.json;filename=0.json" \
  -F "file=@$TMP_DIR/1.json;filename=1.json" \
  -F "file=@$TMP_DIR/2.json;filename=2.json" \
  $([ "$METADATA_TYPE" = "parts" ] && echo "-F \"file=@$TMP_DIR/3.json;filename=3.json\"") \
  -F "pinataMetadata={\"name\":\"holobot-$METADATA_TYPE-metadata\"}" \
  -F "pinataOptions={\"cidVersion\":1,\"wrapWithDirectory\":true}")

echo "📤 Response: $RESPONSE"

# Extract CID from response
CID=$(echo "$RESPONSE" | jq -r '.IpfsHash')

if [ "$CID" = "null" ] || [ -z "$CID" ]; then
    echo "❌ Upload failed!"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Upload successful!"
echo "🔗 IPFS CID: $CID"
echo "🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/$CID"

# Test file access
echo ""
echo "🔍 Testing file access:"
if [ "$METADATA_TYPE" = "genesis" ]; then
    echo "📄 Test URL: https://gateway.pinata.cloud/ipfs/$CID/0.json"
    echo ""
    echo "📝 Add this to your onchain/.env file:"
    echo "GENESIS_BASE_URI=ipfs://$CID/"
elif [ "$METADATA_TYPE" = "parts" ]; then
    echo "📄 Test URL: https://gateway.pinata.cloud/ipfs/$CID/1.json"
    echo ""
    echo "📝 Add this to your onchain/.env file:"
    echo "PARTS_BASE_URI=ipfs://$CID/{id}.json"
fi

echo ""
echo "🎉 Upload complete! CID: $CID"
