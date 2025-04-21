import { League, LeagueTier } from '../types/league';
import { generateUUID } from '../utils/battleUtils';
import { HOLOBOT_STATS } from '../types/holobot';
import { getHolobotImageUrl } from '../utils/holobotUtils';

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
    image: getHolobotImageUrl(holobotKey)
  };
};

export const mockLeagues: League[] = [
  {
    id: generateUUID(),
    name: 'Junkyard League',
    tier: 'junkyard',
    description: 'The entry-level league for beginners. Battle against scrap Holobots assembled from discarded parts.',
    minLevel: 1,
    maxLevel: 5,
    rewards: {
      holos: 50,
      experience: 100,
      gachaTickets: 0
    },
    opponents: [
      {
        id: generateUUID(),
        name: 'Rusty ' + HOLOBOT_STATS.hare.name,
        difficulty: 'easy',
        holobot: createScaledHolobot('hare', 2, 'Junk')
      },
      {
        id: generateUUID(),
        name: 'Junk ' + HOLOBOT_STATS.kuma.name,
        difficulty: 'easy',
        holobot: createScaledHolobot('kuma', 3, 'Junk')
      },
      {
        id: generateUUID(),
        name: 'Scrap ' + HOLOBOT_STATS.tora.name,
        difficulty: 'medium',
        holobot: createScaledHolobot('tora', 4, 'Junk')
      },
      {
        id: generateUUID(),
        name: 'Junkyard ' + HOLOBOT_STATS.wake.name,
        difficulty: 'boss',
        holobot: createScaledHolobot('wake', 5, 'Junk')
      }
    ],
    background: 'https://source.unsplash.com/random/800x600?junkyard',
    icon: 'https://source.unsplash.com/random/100x100?junkyard'
  },
  {
    id: generateUUID(),
    name: 'City Scraps League',
    tier: 'city-scraps',
    description: 'The intermediate league for growing Holobots. Battle against urban Holobots patrolling the city streets.',
    minLevel: 5,
    maxLevel: 10,
    rewards: {
      holos: 100,
      experience: 200,
      gachaTickets: 1
    },
    opponents: [
      {
        id: generateUUID(),
        name: 'Street ' + HOLOBOT_STATS.era.name,
        difficulty: 'easy',
        holobot: createScaledHolobot('era', 6, 'Street')
      },
      {
        id: generateUUID(),
        name: 'Traffic ' + HOLOBOT_STATS.gama.name,
        difficulty: 'medium',
        holobot: createScaledHolobot('gama', 7, 'Street')
      },
      {
        id: generateUUID(),
        name: 'Construction ' + HOLOBOT_STATS.ken.name,
        difficulty: 'medium',
        holobot: createScaledHolobot('ken', 8, 'Street')
      },
      {
        id: generateUUID(),
        name: 'City ' + HOLOBOT_STATS.kurai.name,
        difficulty: 'boss',
        holobot: createScaledHolobot('kurai', 10, 'City')
      }
    ],
    background: 'https://source.unsplash.com/random/800x600?city',
    icon: 'https://source.unsplash.com/random/100x100?city'
  },
  {
    id: generateUUID(),
    name: 'Neon Core League',
    tier: 'neon-core',
    description: 'The advanced league for seasoned Holobots. Battle against high-tech Holobots in the neon-lit core of the city.',
    minLevel: 10,
    maxLevel: 15,
    rewards: {
      holos: 200,
      experience: 400,
      gachaTickets: 2
    },
    opponents: [
      {
        id: generateUUID(),
        name: 'Neon ' + HOLOBOT_STATS.tsuin.name,
        difficulty: 'medium',
        holobot: createScaledHolobot('tsuin', 11, 'Neon')
      },
      {
        id: generateUUID(),
        name: 'Data ' + HOLOBOT_STATS.wolf.name,
        difficulty: 'medium',
        holobot: createScaledHolobot('wolf', 12, 'Neon')
      },
      {
        id: generateUUID(),
        name: 'Security ' + HOLOBOT_STATS.shadow.name,
        difficulty: 'hard',
        holobot: createScaledHolobot('shadow', 13, 'Neon')
      },
      {
        id: generateUUID(),
        name: 'Core ' + HOLOBOT_STATS.ace.name,
        difficulty: 'boss',
        holobot: createScaledHolobot('ace', 15, 'Neon')
      }
    ],
    background: 'https://source.unsplash.com/random/800x600?neon',
    icon: 'https://source.unsplash.com/random/100x100?neon'
  },
  {
    id: generateUUID(),
    name: 'Overlord League',
    tier: 'overlord',
    description: 'The elite league for the most powerful Holobots. Battle against the most advanced AI Holobots for ultimate glory.',
    minLevel: 15,
    maxLevel: 20,
    rewards: {
      holos: 500,
      experience: 1000,
      gachaTickets: 5,
      blueprints: ['legendary-part']
    },
    opponents: [
      {
        id: generateUUID(),
        name: 'Elite ' + HOLOBOT_STATS.kuma.name,
        difficulty: 'hard',
        holobot: createScaledHolobot('kuma', 16, 'Elite')
      },
      {
        id: generateUUID(),
        name: 'Elite ' + HOLOBOT_STATS.tora.name,
        difficulty: 'hard',
        holobot: createScaledHolobot('tora', 17, 'Elite')
      },
      {
        id: generateUUID(),
        name: 'Elite ' + HOLOBOT_STATS.shadow.name,
        difficulty: 'hard',
        holobot: createScaledHolobot('shadow', 18, 'Elite')
      },
      {
        id: generateUUID(),
        name: 'Overlord ' + HOLOBOT_STATS.ace.name,
        difficulty: 'boss',
        holobot: createScaledHolobot('ace', 20, 'Overlord')
      }
    ],
    background: 'https://source.unsplash.com/random/800x600?futuristic',
    icon: 'https://source.unsplash.com/random/100x100?futuristic'
  }
];