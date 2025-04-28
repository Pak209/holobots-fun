import { PlayerSnapshot } from '../types/league';
import { generateUUID } from '../utils/battleUtils';
import { HOLOBOT_STATS } from '../types/holobot';

class SnapshotService {
  async getRandomOpponent(): Promise<PlayerSnapshot> {
    // In a real app, this would fetch from an API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get a random holobot key
        const holobotKeys = Object.keys(HOLOBOT_STATS);
        const randomKey = holobotKeys[Math.floor(Math.random() * holobotKeys.length)];
        const baseStats = HOLOBOT_STATS[randomKey];
        
        // Random level between 1 and 20
        const level = Math.floor(Math.random() * 20) + 1;
        const scaleFactor = 1 + (level * 0.1); // 10% increase per level
        
        // Random tier prefix based on level
        let prefix = 'Junk';
        let tier: 'junkyard' | 'city-scraps' | 'neon-core' | 'overlord' = 'junkyard';
        
        if (level >= 15) {
          prefix = 'Elite';
          tier = 'overlord';
        } else if (level >= 10) {
          prefix = 'Neon';
          tier = 'neon-core';
        } else if (level >= 5) {
          prefix = 'Street';
          tier = 'city-scraps';
        }
        
        // Create a random opponent
        const opponent: PlayerSnapshot = {
          id: generateUUID(),
          userId: generateUUID(),
          username: `Player_${Math.floor(Math.random() * 1000)}`,
          avatarUrl: `https://source.unsplash.com/random/100x100?robot&sig=${Math.random()}`,
          holobot: {
            id: generateUUID(),
            name: `${prefix} ${baseStats.name}`,
            level,
            experience: level * 100,
            type: baseStats.specialMove ? 'tech' : 'balanced',
            rarity: level > 15 ? 'legendary' : level > 10 ? 'rare' : 'common',
            stats: {
              health: Math.floor(baseStats.maxHealth * scaleFactor),
              attack: Math.floor(baseStats.attack * scaleFactor),
              defense: Math.floor(baseStats.defense * scaleFactor),
              speed: Math.floor(baseStats.speed * scaleFactor)
            },
            specialAbility: baseStats.specialMove || 'Special Attack',
            image: `https://source.unsplash.com/random/300x300?robot&sig=${randomKey}`
          },
          createdAt: new Date(),
          tier,
          wins: Math.floor(Math.random() * 10),
          losses: Math.floor(Math.random() * 5)
        };
        
        resolve(opponent);
      }, 500);
    });
  }
}

export const snapshotService = new SnapshotService();