import { BattleResult, BattleTicket, League, LeagueTier, PlayerSnapshot } from '../types/league';
import { mockLeagues } from '../mocks/leagues';
import { generateUUID } from '../utils/battleUtils';
import { HOLOBOT_STATS } from '../types/holobot';

// Helper function to create a scaled holobot based on level
const createScaledHolobot = (holobotKey: string, level: number, prefix: string) => {
  const baseStats = HOLOBOT_STATS[holobotKey];
  const scaleFactor = 1 + (level * 0.1); // 10% increase per level
  
  return {
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
    image: `https://source.unsplash.com/random/300x300?robot&sig=${holobotKey}`
  };
};

// This would be replaced with actual API calls in a production app
class LeagueService {
  async getLeagues(): Promise<League[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLeagues);
      }, 500);
    });
  }

  async getBattleTickets(): Promise<BattleTicket[]> {
    // In a real app, this would fetch from an API
    // For now, we'll generate some mock tickets
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tickets: BattleTicket[] = [];
        for (let i = 0; i < 10; i++) {
          tickets.push({
            id: generateUUID(),
            userId: 'current-user', // This would be the actual user ID
            createdAt: new Date(),
            expiresAt: tomorrow,
            used: i < 3 // First 3 are used
          });
        }
        resolve(tickets);
      }, 300);
    });
  }

  async getBattleResults(): Promise<BattleResult[]> {
    // In a real app, this would fetch from an API
    return new Promise((resolve) => {
      setTimeout(() => {
        // This would be replaced with actual battle results
        resolve([]);
      }, 300);
    });
  }

  async getLeaderboard(tier: LeagueTier): Promise<PlayerSnapshot[]> {
    // In a real app, this would fetch from an API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock leaderboard data
        const leaderboard: PlayerSnapshot[] = [];
        const names = [
          "CyberNinja", "QuantumQuasar", "NeonShadow", "ByteRunner", 
          "SynthWave", "PixelProwler", "DataDrifter", "VoxelVoyager",
          "GlitchGladiator", "TechnoTitan"
        ];
        
        // Use different holobots for each tier
        const holobotKeys = {
          'junkyard': ['hare', 'kuma', 'tora', 'wake', 'era', 'gama', 'ken', 'kurai', 'tsuin', 'wolf'],
          'city-scraps': ['kuma', 'tora', 'shadow', 'ace', 'hare', 'wake', 'era', 'gama', 'ken', 'kurai'],
          'neon-core': ['shadow', 'ace', 'kuma', 'tora', 'wolf', 'tsuin', 'ken', 'gama', 'era', 'wake'],
          'overlord': ['ace', 'shadow', 'kuma', 'tora', 'wolf', 'tsuin', 'ken', 'gama', 'era', 'wake']
        };
        
        // Get holobot keys for the current tier
        const tierHolobots = holobotKeys[tier] || holobotKeys['junkyard'];
        
        // Base level for each tier and prefix
        const tierConfig = {
          'junkyard': { baseLevel: 1, prefix: 'Junk' },
          'city-scraps': { baseLevel: 5, prefix: 'Street' },
          'neon-core': { baseLevel: 10, prefix: 'Neon' },
          'overlord': { baseLevel: 15, prefix: 'Elite' }
        };
        
        const { baseLevel, prefix } = tierConfig[tier] || tierConfig['junkyard'];
        
        for (let i = 0; i < 10; i++) {
          const holobotKey = tierHolobots[i];
          const level = baseLevel + (10 - i);
          
          leaderboard.push({
            id: generateUUID(),
            userId: generateUUID(),
            username: names[i],
            avatarUrl: `https://source.unsplash.com/random/100x100?robot&sig=${i}`,
            holobot: createScaledHolobot(holobotKey, level, prefix),
            createdAt: new Date(),
            tier,
            wins: 10 - i,
            losses: i
          });
        }
        
        resolve(leaderboard);
      }, 500);
    });
  }

  async useTicket(ticketId: string): Promise<void> {
    // In a real app, this would call an API to mark the ticket as used
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  async refreshDailyTickets(): Promise<void> {
    // In a real app, this would call an API to refresh daily tickets
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  async claimBattleRewards(battleId: string): Promise<void> {
    // In a real app, this would call an API to claim rewards
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  async purchaseTickets(): Promise<void> {
    // In a real app, this would call an API to purchase tickets
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
}

export const leagueService = new LeagueService();