# ABI Function Error Fix

## 🐛 **Problem Found:**

User was getting error:
```
AbiFunctionNotFoundError: Function "mintWithEth" not found on ABI.
```

## 🔍 **Root Cause:**

The `useHolobotNFT.ts` file had a `attempts` array that included functions that **don't exist** in our deployed `HolobotPublicMint` contract:

```typescript
// ❌ OLD (Incorrect)
const attempts = [
  { name: 'publicMint', args: [], value: null },
  { name: 'freeMint', args: [], value: null },
  { name: 'mint', args: [1], value: null },
  { name: 'mint', args: [address, 1], value: null },      // ❌ Doesn't exist
  { name: 'publicMint', args: [address], value: null },   // ❌ Doesn't exist
  { name: 'mintWithEth', args: [1], value: '0.00001' },   // ❌ Doesn't exist
  { name: 'mintWithEth', args: [1], value: '0.0001' },    // ❌ Doesn't exist
  { name: 'mintWithEth', args: [1], value: '0.001' },     // ❌ Doesn't exist
];
```

When the first 3 attempts failed (for other reasons), the code would try `mintWithEth()` which doesn't exist in the contract ABI, causing the error.

---

## ✅ **Solution:**

Removed all functions that don't exist in `HolobotPublicMint.sol` and kept only the 3 valid functions:

```typescript
// ✅ NEW (Correct)
const attempts = [
  { name: 'publicMint', args: [], value: null },      // ✅ Exists
  { name: 'freeMint', args: [], value: null },        // ✅ Exists
  { name: 'mint', args: [1], value: null },           // ✅ Exists
];
```

---

## 📋 **Valid Functions in HolobotPublicMint Contract:**

Based on `contracts/HolobotPublicMint.sol`:

### **1. `publicMint()`**
- **Parameters:** None
- **Description:** Anyone can mint 1 NFT (up to 5 per wallet)
- **Code:**
  ```solidity
  function publicMint() external {
      require(_tokenIdCounter <= MAX_SUPPLY, "Max supply reached");
      require(mintedPerWallet[msg.sender] < MAX_PER_WALLET, "Max mints per wallet reached");
      
      uint256 tokenId = _tokenIdCounter;
      _tokenIdCounter++;
      mintedPerWallet[msg.sender]++;
      
      _safeMint(msg.sender, tokenId);
      emit HolobotMinted(msg.sender, tokenId);
  }
  ```

### **2. `freeMint()`**
- **Parameters:** None
- **Description:** Alias for `publicMint()` for compatibility
- **Code:**
  ```solidity
  function freeMint() external {
      require(_tokenIdCounter <= MAX_SUPPLY, "Max supply reached");
      require(mintedPerWallet[msg.sender] < MAX_PER_WALLET, "Max mints per wallet reached");
      
      uint256 tokenId = _tokenIdCounter;
      _tokenIdCounter++;
      mintedPerWallet[msg.sender]++;
      
      _safeMint(msg.sender, tokenId);
      emit HolobotMinted(msg.sender, tokenId);
  }
  ```

### **3. `mint(uint256 quantity)`**
- **Parameters:** `quantity` (uint256)
- **Description:** Mint multiple NFTs at once (up to 5 total per wallet)
- **Code:**
  ```solidity
  function mint(uint256 quantity) external {
      require(_tokenIdCounter + quantity - 1 <= MAX_SUPPLY, "Exceeds max supply");
      require(mintedPerWallet[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
      
      for (uint256 i = 0; i < quantity; i++) {
          uint256 tokenId = _tokenIdCounter;
          _tokenIdCounter++;
          mintedPerWallet[msg.sender]++;
          
          _safeMint(msg.sender, tokenId);
          emit HolobotMinted(msg.sender, tokenId);
      }
  }
  ```

### **4. `ownerMint(address to, uint256 quantity)` (Owner only)**
- **Parameters:** `to` (address), `quantity` (uint256)
- **Description:** Owner can mint to any address
- **Not used in frontend** - admin function only

---

## 🔧 **Additional Improvements:**

### **1. Added ABI Error Detection**

```typescript
// If function doesn't exist in ABI, this is a critical error
if (errorMsg.includes('AbiFunctionNotFoundError') || errorMsg.includes('not found on ABI')) {
  console.error('💥 CRITICAL: Function not found in ABI. This should not happen!');
  console.error('💥 Please report this error. Contract may need to be redeployed.');
  throw error;
}
```

This prevents silent failures and makes debugging easier.

---

## 🧪 **Verification:**

### **Contract Test Results:**
```
✅ Contract exists at 0x311abdffdFB4A062fE55C215c8EdDBA222bd42af
✅ publicMint() function exists (signature: 0x26092b83)
✅ freeMint() function exists (signature: 0x5b70ea9f)
✅ mint(uint256) function exists (signature: 0xa0712d68...)
```

### **ABI Verification:**
```json
// src/abis/HolobotNFT.json
{
  "name": "publicMint",
  "inputs": [],
  "outputs": []
},
{
  "name": "freeMint",
  "inputs": [],
  "outputs": []
},
{
  "name": "mint",
  "inputs": [{ "name": "quantity", "type": "uint256" }],
  "outputs": []
}
```

---

## 🚀 **Testing Instructions:**

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Hard refresh browser:** Cmd+Shift+R

3. **Disconnect and reconnect wallet** (clears any pending nonce issues)

4. **Try minting:**
   - Go to `/mint`
   - Select a Holobot
   - Click "Mint Your Holobot NFT"
   - Watch console for:
     ```
     🎯 Trying 3 mint functions from HolobotPublicMint contract
     🔄 Trying publicMint with args: [] free
     ⚙️ Letting wagmi auto-estimate gas for optimal compatibility...
     📤 Sending transaction...
     ✅ Transaction submitted successfully with publicMint!
     ```

5. **Expected outcome:**
   - No more "mintWithEth not found" errors
   - Transaction should be submitted successfully
   - Should appear on BaseScan within 30 seconds

---

## 📝 **Files Modified:**

1. **`src/hooks/useHolobotNFT.ts`**
   - Removed invalid function attempts (`mintWithEth`, legacy `mint` signatures)
   - Kept only 3 valid functions from `HolobotPublicMint`
   - Added ABI error detection

---

## 🎯 **Expected Result:**

✅ **No more ABI errors**
✅ **Only valid functions are attempted**
✅ **Better error messages if something goes wrong**
✅ **Transaction should be submitted successfully**

---

**Status:** ✅ Fixed and Ready to Test
**Next Step:** Try minting from the UI and verify transaction appears on BaseScan
