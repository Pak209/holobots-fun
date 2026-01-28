# Deploy PvP Multiplayer - Step by Step

## ✅ Step 1: Install Functions Dependencies

Open a terminal and run:

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun/functions
npm install
```

**Expected output**: Should install `firebase-admin` and `firebase-functions`

---

## ✅ Step 2: Build Functions

```bash
npm run build
```

**Expected output**: 
- Creates `lib/` folder
- Compiles TypeScript to JavaScript
- No errors

---

## ✅ Step 3: Deploy Functions to Firebase

```bash
cd /Users/danielpak/holobots.FBmigration/holobots-fun
firebase deploy --only functions
```

**Expected output**:
```
✔ functions[matchmaker] Successful create operation
✔ functions[cleanupAbandonedRooms] Successful create operation
```

**If you get permission errors**, try:
```bash
firebase login --reauth
firebase use holobots-24046
firebase deploy --only functions
```

---

## ✅ Step 4: Update Firestore Security Rules

### Option A: Via Firebase Console (Easiest)

1. Go to: https://console.firebase.google.com/
2. Select your project: **holobots-24046**
3. Click **Firestore Database** in left menu
4. Click **Rules** tab
5. Add these rules to your existing rules:

```javascript
// Add these INSIDE your existing rules, after your other match statements

// Battle Rooms - Real-time PvP
match /battle_rooms/{roomId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
    (request.auth.uid == resource.data.players.p1.uid || 
     request.auth.uid == resource.data.players.p2.uid);
  allow delete: if request.auth != null;
}

// Battle Pool Entries - Matchmaking
match /battle_pool_entries/{entryId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  allow update: if request.auth != null;
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

6. Click **Publish**

### Option B: Via Command Line

Create/update `firestore.rules` file, then:

```bash
firebase deploy --only firestore:rules
```

---

## ✅ Step 5: Test the Deployment

### Test 1: Create a Room

1. Refresh your app: http://localhost:8080/
2. Click **PvP** tab
3. Select a Holobot
4. Click **Create Private Room**
5. **Expected**: Should get a 6-character code (e.g., "ABC123")
6. **Check Firebase Console**: 
   - Go to Firestore Database
   - Should see new collection: `battle_rooms`
   - Should see your room document

### Test 2: Matchmaking

1. Open two browser windows (or use incognito)
2. Login with different accounts in each
3. Both windows: Select Holobot → Click **Quick Match**
4. **Expected**: Should automatically create a battle room
5. **Check Firebase Console**:
   - Go to Functions → Logs
   - Should see: "Match created! Room ID: xyz, Room Code: ABC123"

### Test 3: Join by Code

1. Window 1: Create room → Get code
2. Window 2: Enter code → Click Join Room
3. **Expected**: Both windows show battle screen
4. Both players see each other's Holobots

---

## 🐛 Troubleshooting

### "Permission denied" when deploying

```bash
# Re-authenticate
firebase login --reauth

# Make sure you're using the right project
firebase use holobots-24046

# Try again
firebase deploy --only functions
```

### Functions deploy but don't work

```bash
# Check function logs
firebase functions:log

# Look for errors
firebase functions:log --only matchmaker
```

### "Room not found" error

- Make sure Firestore rules are published
- Check Firebase Console → Firestore Database → Rules
- Verify the rules include `battle_rooms` and `battle_pool_entries`

### Matchmaking not working

1. Check Functions deployed: `firebase functions:list`
2. Check function logs: `firebase functions:log --only matchmaker`
3. Verify two users are searching simultaneously

---

## 📋 Quick Command Reference

```bash
# Navigate to functions
cd /Users/danielpak/holobots.FBmigration/holobots-fun/functions

# Install & build
npm install && npm run build

# Go back to root
cd ..

# Deploy everything
firebase deploy --only functions,firestore:rules

# Check what's deployed
firebase functions:list

# View logs
firebase functions:log

# View specific function logs
firebase functions:log --only matchmaker
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Functions deployed (check `firebase functions:list`)
- [ ] Firestore rules updated (check Firebase Console)
- [ ] Can create room (get 6-char code)
- [ ] Can join room by code
- [ ] Matchmaking pairs players
- [ ] Real-time sync works (both devices update)
- [ ] Battle completes successfully

---

## 🎉 You're Done!

Once all tests pass, your PvP multiplayer system is live!

Players can now:
- ✅ Battle in real-time on separate devices
- ✅ Use Quick Match for automatic pairing
- ✅ Create private rooms with shareable codes
- ✅ See live updates during battles

---

## Need Help?

If you get stuck:
1. Check browser console (F12) for errors
2. Check Firebase Console → Functions → Logs
3. Check Firestore Database to see if documents are created
4. Review: `REALTIME_ARENA_GUIDE.md` for detailed troubleshooting
