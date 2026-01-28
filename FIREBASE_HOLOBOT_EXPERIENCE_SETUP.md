# Firebase Setup for Holobot Experience & Leveling 🔧

**Date**: January 27, 2026  
**Status**: Complete Setup Guide

---

## ✅ What You Need to Do

### Option 1: Automatic Fix (Easiest!) ⭐

**The app will automatically fix your holobots when you visit the Holobots page!**

**Steps:**
1. Open your app
2. Navigate to **Holobots Info** page
3. Open browser console (F12)
4. Look for: `[Fix] Initializing experience fields for KUMA`
5. Your holobots will be automatically fixed!

**What It Does:**
- Checks if holobots have `experience` and `nextLevelExp` fields
- Initializes missing fields automatically
- Sets experience to current value or 0
- Calculates correct `nextLevelExp` based on level
- Saves to Firebase immediately

---

### Option 2: Deploy Firestore Rules (If Not Done)

If you haven't deployed your Firestore rules yet:

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun
firebase deploy --only firestore:rules
```

**Current Rules:**
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

This allows users to:
- ✅ Read any user profile
- ✅ Write to their OWN profile only
- ✅ Update their holobots array

---

### Option 3: Manual Migration Script (Advanced)

If you want to fix ALL users at once (not just yourself):

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun/scripts
node fix-holobot-experience.js
```

**What It Does:**
- Scans ALL users in Firebase
- Finds holobots missing experience/level fields
- Initializes them properly
- Updates Firebase in bulk

---

## 🔍 How to Verify It's Working

### Step 1: Check Your Holobot Data

1. Open **Holobots Info** page
2. Open **Console** (F12)
3. Look for these logs:

```
[Fix] Initializing experience fields for KUMA
[Auto-Level] Checking holobots: [{name: "KUMA", level: 2, exp: 809, nextLevelExp: 400}]
[Auto-Level] KUMA: 809/400 (Level 2)
[Auto-Level] KUMA NEEDS LEVEL UP! 809 >= 400
[Level Up] KUMA: Level 2 → 3 (+1 levels)
```

### Step 2: Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Navigate to: `users` → `{your-user-id}` → `holobots`
5. Check if KUMA has:
   ```json
   {
     "name": "KUMA",
     "level": 2,
     "experience": 809,
     "nextLevelExp": 400,
     "boostedAttributes": {},
     "attributePoints": 0
   }
   ```

---

## 🐛 Common Issues & Solutions

### Issue 1: Experience Field is Missing

**Symptom:** Console shows `experience: undefined`

**Fix:** Automatic fix will handle this! Just visit Holobots Info page.

**Manual Fix:**
```javascript
// In Firebase Console, edit your user document:
holobots: [
  {
    name: "KUMA",
    level: 2,
    experience: 0,  // Add this
    nextLevelExp: 400  // Add this
  }
]
```

---

### Issue 2: Experience is Saved but Level Doesn't Change

**Symptom:** 
```
[Auto-Level] KUMA: 809/400 (Level 2)
[Auto-Level] KUMA already processed for level 2
```

**Cause:** Level-up was triggered but save failed

**Fix:**
1. Check Firebase console for errors
2. Verify user document can be updated
3. Try manually setting level to 3 in Firebase to test

---

### Issue 3: Firestore Permission Denied

**Symptom:** Console shows "Permission denied" when trying to save

**Cause:** Firestore rules not deployed or incorrect

**Fix:**
```bash
firebase deploy --only firestore:rules
```

Then verify in Firebase Console → Firestore → Rules:
```javascript
match /users/{userId} {
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

---

### Issue 4: Experience Resets to 0

**Symptom:** Experience keeps going back to 0 after refresh

**Cause:** Old code or migration is overwriting data

**Fix:**
1. Check if any other code is resetting experience
2. Look for `experience: 0` hardcoded anywhere
3. Ensure `calculateExperience()` is being used correctly

---

## 📊 Required Firebase Structure

Your user document should look like this:

```json
{
  "id": "user123",
  "username": "player1",
  "holobots": [
    {
      "name": "KUMA",
      "level": 2,
      "experience": 809,
      "nextLevelExp": 400,
      "boostedAttributes": {
        "attack": 0,
        "defense": 0,
        "speed": 0,
        "health": 0
      },
      "attributePoints": 0,
      "pvpWins": 0,
      "pvpLosses": 0
    }
  ],
  "holosTokens": 700,
  "gachaTickets": 0,
  "arenaPassses": 26
}
```

**Required Fields for Each Holobot:**
- ✅ `name` (string)
- ✅ `level` (number)
- ✅ `experience` (number) ← **REQUIRED FOR LEVELING**
- ✅ `nextLevelExp` (number) ← **REQUIRED FOR LEVELING**
- ✅ `boostedAttributes` (object)
- ✅ `attributePoints` (number)

**Optional but Recommended:**
- `pvpWins` (number) - For intelligence calculation
- `pvpLosses` (number) - For intelligence calculation

---

## 🔄 Experience Calculation Formula

```javascript
function calculateExperience(level) {
  const baseExp = 100;
  const expMultiplier = 1.5;
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

// Examples:
// Level 1 → 0 EXP required
// Level 2 → 100 EXP required
// Level 3 → 150 EXP required
// Level 4 → 225 EXP required
// Level 5 → 337 EXP required
```

---

## ✅ Checklist

**Setup:**
- [ ] Firestore rules deployed
- [ ] Visited Holobots Info page (triggers automatic fix)
- [ ] Checked console for `[Fix]` logs
- [ ] Verified Firebase has experience fields

**Testing:**
- [ ] Win a battle to gain EXP
- [ ] Check console for `[Auto-Level]` logs
- [ ] Navigate to Holobots Info page
- [ ] Holobot should level up automatically
- [ ] Level-up modal should appear

**Verification:**
- [ ] Firebase console shows correct experience
- [ ] Level increases when EXP >= nextLevelExp
- [ ] Attribute points granted on level-up
- [ ] Experience persists after refresh

---

## 🎯 Next Steps

1. **Just visit Holobots Info page** - Automatic fix will run!
2. **Check console logs** - See if experience fields are initialized
3. **Win a battle** - Gain experience and test leveling
4. **Share console logs** if it still doesn't work

---

## 📝 Summary

**You DON'T need to:**
- ❌ Manually edit Firebase database
- ❌ Run migration scripts
- ❌ Change any code

**You DO need to:**
- ✅ Visit Holobots Info page once (automatic fix runs)
- ✅ Check console for `[Fix]` and `[Auto-Level]` logs
- ✅ Let me know if you see any errors!

**The automatic fix handles everything!** Just refresh your app and visit the Holobots page. 🎉
