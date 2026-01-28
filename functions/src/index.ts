import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// ============================================================================
// Matchmaker Cloud Function
// Automatically matches players who enter the battle pool
// ============================================================================

export const matchmaker = onDocumentCreated("battle_pool_entries/{entryId}", async (event) => {
    const newEntry = event.data?.data();
    if (!newEntry || !newEntry.isActive) {
        console.log("Entry is not active, skipping matchmaking");
        return;
    }

    console.log(`New matchmaking entry: ${event.params.entryId} for user ${newEntry.userId}`);

    try {
        // 1. Look for another active player in the pool (excluding yourself)
        const poolRef = db.collection("battle_pool_entries");
        const potentialMatch = await poolRef
            .where("isActive", "==", true)
            .where("userId", "!=", newEntry.userId)
            .limit(1)
            .get();

        if (potentialMatch.empty) {
            console.log("No match found yet, waiting in pool...");
            return;
        }

        const opponentEntry = potentialMatch.docs[0].data();
        const opponentDocId = potentialMatch.docs[0].id;

        console.log(`Match found! Pairing ${newEntry.userId} with ${opponentEntry.userId}`);

        // 2. Generate room code
        const roomCode = generateRoomCode();

        // 3. Create the Battle Room
        const roomRef = db.collection("battle_rooms").doc();
        await roomRef.set({
            roomId: roomRef.id,
            roomCode,
            status: "active",
            createdAt: FieldValue.serverTimestamp(),
            startedAt: FieldValue.serverTimestamp(),
            currentTurn: 1,
            turnPhase: "selection",
            currentTurnPlayer: "p1", // First player goes first
            p1Action: null,
            p2Action: null,
            winner: null,
            actionHistory: [],
            players: {
                p1: { 
                    uid: newEntry.userId, 
                    username: newEntry.username, 
                    holobot: newEntry.holobotStats,
                    health: newEntry.holobotStats?.maxHealth || 100,
                    maxHealth: newEntry.holobotStats?.maxHealth || 100,
                    stamina: 10,
                    maxStamina: 10,
                    specialMeter: 0,
                    isReady: false,
                    isConnected: true,
                    lastHeartbeat: FieldValue.serverTimestamp(),
                    damageDealt: 0,
                    damageTaken: 0,
                    perfectDefenses: 0,
                    combosCompleted: 0,
                },
                p2: { 
                    uid: opponentEntry.userId, 
                    username: opponentEntry.username, 
                    holobot: opponentEntry.holobotStats,
                    health: opponentEntry.holobotStats?.maxHealth || 100,
                    maxHealth: opponentEntry.holobotStats?.maxHealth || 100,
                    stamina: 10,
                    maxStamina: 10,
                    specialMeter: 0,
                    isReady: false,
                    isConnected: true,
                    lastHeartbeat: FieldValue.serverTimestamp(),
                    damageDealt: 0,
                    damageTaken: 0,
                    perfectDefenses: 0,
                    combosCompleted: 0,
                }
            },
            config: {
                battleType: newEntry.battleType || "pvp",
                maxTurns: 50,
                turnTimeLimit: 30,
                allowSpectators: false,
                isPrivate: false,
                healthMultiplier: 1.0,
                damageMultiplier: 1.0,
                staminaMultiplier: 1.0,
            },
            lastActionAt: FieldValue.serverTimestamp(),
        });

        // 4. Mark both entries as inactive and assign room ID
        const batch = db.batch();
        batch.update(poolRef.doc(event.params.entryId), { 
            isActive: false, 
            roomId: roomRef.id 
        });
        batch.update(poolRef.doc(opponentDocId), { 
            isActive: false, 
            roomId: roomRef.id 
        });
        await batch.commit();

        console.log(`✅ Match created! Room ID: ${roomRef.id}, Room Code: ${roomCode}`);

    } catch (error) {
        console.error("Error in matchmaker:", error);
        throw error;
    }
});

// ============================================================================
// Helper: Generate Room Code
// ============================================================================

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================================================
// Cleanup: Remove abandoned rooms
// ============================================================================

export const cleanupAbandonedRooms = onDocumentCreated("battle_rooms/{roomId}", async (event) => {
    const roomId = event.params.roomId;
    
    // Delete room after 2 hours if not completed
    setTimeout(async () => {
        try {
            const roomRef = db.collection("battle_rooms").doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (!roomSnap.exists) return;
            
            const room = roomSnap.data();
            
            // Only delete if still in waiting or abandoned status
            if (room?.status === 'waiting' || room?.status === 'abandoned') {
                await roomRef.delete();
                console.log(`Cleaned up abandoned room: ${roomId}`);
            }
        } catch (error) {
            console.error(`Error cleaning up room ${roomId}:`, error);
        }
    }, 2 * 60 * 60 * 1000); // 2 hours
});
