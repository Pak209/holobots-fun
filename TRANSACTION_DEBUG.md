# Transaction Debugging - "Never Appeared on Blockchain" Error

## 🔍 Current Issue

User is getting error: **"Transaction was submitted but never appeared on the blockchain"**

This is different from the earlier "speed up" issue. Now the transaction is being:
1. ✅ Submitted via `writeContractAsync()` - returns a hash
2. ❌ Never appearing in RPC queries - `getTransaction()` returns nothing
3. ❌ Never confirmed on BaseScan

---

## 🎯 Possible Causes

### 1. **RPC Slow Indexing**
- The RPC received the transaction but is slow to index it
- Solution: Increase wait time and retries (now 10 attempts x 3 seconds = 30 seconds)

### 2. **Transaction Rejected Silently**
- The RPC validates and rejects the transaction but still returns a hash
- Possible reasons:
  - Nonce collision (multiple pending transactions)
  - Gas parameters invalid or too aggressive
  - Transaction data malformed

### 3. **Wallet Replacing Transaction**
- MetaMask/wallet replaced the transaction with a different one
- Original hash becomes invalid

### 4. **EIP-1559 Compatibility Issues**
- Base Sepolia might not like our EIP-1559 parameters
- Solution: Let wagmi auto-estimate gas instead of manual setting

---

## 🔧 Fixes Applied

### **Fix 1: Removed Manual Gas Parameters**

**Before:**
```typescript
const txParams = {
  address: CONTRACT_ADDRESSES.holobotNFT,
  abi: HolobotABI,
  functionName: 'publicMint',
  args: [],
  chain,
  account: address,
  gas: 300000n, // Manual
  maxFeePerGas: (baseFee * 2) + 2_000_000_000n, // Manual
  maxPriorityFeePerGas: 2_000_000_000n, // Manual
};
```

**After:**
```typescript
const txParams = {
  address: CONTRACT_ADDRESSES.holobotNFT,
  abi: HolobotABI,
  functionName: 'publicMint',
  args: [],
  chain,
  account: address,
  // Let wagmi auto-estimate gas for optimal compatibility
};
```

**Why:** Wagmi/viem will automatically estimate gas and set appropriate parameters based on current network conditions.

---

### **Fix 2: Increased Transaction Verification Retries**

**Before:**
```typescript
for (let i = 0; i < 5; i++) {
  // Try to get transaction
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
}
// Total wait: 10 seconds
```

**After:**
```typescript
for (let i = 0; i < 10; i++) {
  // Try to get transaction
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
}
// Total wait: 30 seconds
```

**Why:** Gives RPC more time to index the transaction before giving up.

---

### **Fix 3: Better Transaction Submission Logging**

Added:
- Immediate transaction verification after submission
- Wait 1 second before checking if tx exists in mempool
- Log full transaction details (hash, from, to, nonce)
- Better error messages with BaseScan links

---

### **Fix 4: Wrapped Transaction Send in Try-Catch**

```typescript
try {
  hash = await writeContractAsync(txParams);
  console.log('✅ Transaction submitted successfully');
  
  // Immediately verify
  await new Promise(resolve => setTimeout(resolve, 1000));
  const txCheck = await publicClient.getTransaction({ hash });
  if (!txCheck) {
    console.warn('⚠️ Not yet visible, will retry...');
  }
  
  break; // Success
} catch (sendError) {
  console.error('❌ Failed to send:', sendError);
  throw sendError;
}
```

**Why:** Catches submission errors immediately instead of assuming success.

---

## 🧪 Testing Steps

1. **Clear browser cache and restart dev server:**
   ```bash
   # Terminal 1: Stop server (Ctrl+C)
   npm run dev
   ```

2. **Hard refresh browser:**
   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. **Disconnect and reconnect wallet:**
   - This clears any pending nonce issues

4. **Open browser console (F12)**

5. **Try minting and watch for:**
   ```
   ⚙️ Letting wagmi auto-estimate gas for optimal compatibility...
   📤 Sending transaction...
   ✅ Transaction submitted successfully with publicMint!
   📝 Transaction hash: 0x...
   ⏳ Verifying transaction was accepted by the network...
   ✅ Transaction confirmed in network mempool
   ⏳ Waiting for transaction to be mined...
   ⏳ Attempt 1/10: Transaction not yet visible, waiting 3 seconds...
   ✅ Transaction found in mempool/blockchain!
   ```

6. **If it still fails:**
   - Copy the transaction hash from console
   - Check on BaseScan manually: https://sepolia.basescan.org/tx/[hash]
   - Look for error message or "Transaction Not Found"

---

## 🔍 Debugging Information to Collect

If the issue persists, please provide:

1. **Full console log** from mint attempt
2. **Transaction hash** from the error
3. **MetaMask activity tab** screenshot
4. **BaseScan search** result for the hash
5. **Network tab** in browser DevTools (look for RPC errors)

### **Check These:**

1. **Wallet Nonce:**
   ```
   Check MetaMask → Activity tab
   Are there any pending transactions?
   ```

2. **RPC Endpoint:**
   ```
   Console should show: "🌐 Using RPC endpoint: ..."
   Is it https://sepolia.base.org?
   ```

3. **Chain ID:**
   ```
   Console should show: "✅ RPC confirms Chain ID: 84532"
   Does it match?
   ```

4. **Balance:**
   ```
   Console should show: "💰 Wallet balance: 0.xxx ETH"
   Is it > 0?
   ```

---

## 🎓 Alternative Solutions to Try

### **Option 1: Use Legacy Gas Pricing**

If EIP-1559 is causing issues, we can fallback to legacy:

```typescript
const txParams = {
  address: CONTRACT_ADDRESSES.holobotNFT,
  abi: HolobotABI,
  functionName: 'publicMint',
  args: [],
  chain,
  account: address,
  gasPrice: 2000000000n, // 2 gwei legacy
};
```

### **Option 2: Try Different RPC**

Update `wagmi-config.ts` to use different RPC:

```typescript
rpcUrls: {
  default: {
    http: [
      'https://base-sepolia-rpc.publicnode.com', // Try this first
      'https://sepolia.base.org',
    ],
  },
}
```

### **Option 3: Manual Transaction Build**

As last resort, build transaction manually with ethers.js:

```typescript
const tx = await signer.sendTransaction({
  to: CONTRACT_ADDRESSES.holobotNFT,
  data: contract.interface.encodeFunctionData('publicMint'),
  gasLimit: 300000,
});
```

---

## 📝 Files Modified

1. **`src/hooks/useHolobotNFT.ts`**
   - Removed manual gas parameters (let wagmi auto-estimate)
   - Increased verification retries to 10 attempts x 3 seconds
   - Added immediate transaction verification after submission
   - Better error logging and try-catch around transaction send

---

**Status:** ✅ Ready to Test
**Expected Outcome:** Transaction should now be found and confirmed within 30 seconds
**If Still Fails:** Collect debugging info above and we'll investigate RPC/wallet issues
