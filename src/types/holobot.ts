
export interface HolobotStats {
    name: string;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
    specialMove: string;
    level: number;
    experience?: number;
    nextLevelExp?: number;
    abilityDescription?: string;
    abilityStats?: string;
    fatigue?: number;
    gasTokens?: number;
    hackUsed?: boolean;
    specialAttackGauge?: number;
    specialAttackThreshold?: number;
    syncPoints?: number;
}

export const HOLOBOT_STATS: Record<string, HolobotStats> = {
    alpha: {
        name: "ALPHA",
        maxHealth: 180,
        attack: 7,
        defense: 7,
        speed: 6,
        intelligence: 6,
        specialMove: "System Override",
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        abilityDescription: "Temporarily boosts all stats by hacking into opponent's system",
        abilityStats: "+2 all stats"
    },
    beta: {
        name: "BETA",
        maxHealth: 160,
        attack: 8,
        defense: 5,
        speed: 7,
        intelligence: 6,
        specialMove: "Logic Bomb",
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        abilityDescription: "Deploys a devastating logic bomb that confuses the opponent",
        abilityStats: "+4 atk | -2 def to opponent"
    },
    gamma: {
        name: "GAMMA",
        maxHealth: 200,
        attack: 6,
        defense: 8,
        speed: 5,
        intelligence: 7,
        specialMove: "Firewall",
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        abilityDescription: "Creates an impenetrable defensive barrier",
        abilityStats: "+5 def"
    },
    ace: {
        name: "ACE",
        maxHealth: 150,
        attack: 8,
        defense: 6,
        speed: 7,
        intelligence: 5,
        specialMove: "1st Strike",
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        abilityDescription: "uses its speed to evade attacks and gets in pos to land the cr.hit",
        abilityStats: "+3 atk | +4 spd"
    },
    kuma: {
        name: "KUMA",
        maxHealth: 200,
        attack: 7,
        defense: 5,
        speed: 3,
        intelligence: 4,
        specialMove: "Sharp Claws",
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        abilityDescription: "unleashes a powerful slash with razor-sharp claws",
        abilityStats: "+5 atk"
    },
    shadow: {
        name: "Shadow",
        maxHealth: 170,
        attack: 5,
        defense: 7,
        speed: 4,
        intelligence: 3,
        specialMove: "Shadow Strike",
        level: 1
    },
    hare: {
        name: "HARE",
        maxHealth: 160,
        attack: 4,
        defense: 5,
        speed: 4,
        intelligence: 3,
        specialMove: "Counter Claw",
        level: 1
    },
    tora: {
        name: "TORA",
        maxHealth: 180,
        attack: 5,
        defense: 4,
        speed: 6,
        intelligence: 4,
        specialMove: "Stalk",
        level: 1
    },
    wake: {
        name: "WAKE",
        maxHealth: 170,
        attack: 6,
        defense: 3,
        speed: 4,
        intelligence: 4,
        specialMove: "Torrent",
        level: 1
    },
    era: {
        name: "ERA",
        maxHealth: 165,
        attack: 5,
        defense: 4,
        speed: 6,
        intelligence: 4,
        specialMove: "Time Warp",
        level: 1
    },
    gama: {
        name: "GAMA",
        maxHealth: 180,
        attack: 6,
        defense: 5,
        speed: 3,
        intelligence: 4,
        specialMove: "Heavy Leap",
        level: 1
    },
    ken: {
        name: "KEN",
        maxHealth: 150,
        attack: 7,
        defense: 3,
        speed: 6,
        intelligence: 5,
        specialMove: "Blade Storm",
        level: 1
    },
    kurai: {
        name: "KURAI",
        maxHealth: 190,
        attack: 4,
        defense: 6,
        speed: 3,
        intelligence: 3,
        specialMove: "Dark Veil",
        level: 1
    },
    tsuin: {
        name: "TSUIN",
        maxHealth: 160,
        attack: 6,
        defense: 4,
        speed: 5,
        intelligence: 4,
        specialMove: "Twin Strike",
        level: 1
    },
    wolf: {
        name: "WOLF",
        maxHealth: 175,
        attack: 5,
        defense: 5,
        speed: 5,
        intelligence: 4,
        specialMove: "Lunar Howl",
        level: 1
    }
};

export function getRank(level: number): string {
    if (level >= 41) return "Legendary";
    if (level >= 31) return "Elite";
    if (level >= 21) return "Rare";
    if (level >= 11) return "Champion";
    if (level >= 2) return "Starter";
    return "Rookie";
}
