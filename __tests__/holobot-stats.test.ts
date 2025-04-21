import '@testing-library/jest-dom';
import { HOLOBOT_STATS } from '@/types/holobot';
import { Holobot } from '@/types/battle';
import { applyAttributeBoosts } from '@/utils/holobotUtils';

describe('Holobot Stats', () => {
  describe('Base Stats', () => {
    it('should have correct base stats for ACE', () => {
      const aceStats = HOLOBOT_STATS.ace;
      expect(aceStats).toBeDefined();
      expect(aceStats.name).toBe('ACE');
      expect(aceStats.maxHealth).toBe(150);
      expect(aceStats.attack).toBe(8);
      expect(aceStats.defense).toBe(6);
      expect(aceStats.speed).toBe(7);
      expect(aceStats.intelligence).toBe(5);
      expect(aceStats.specialMove).toBe('1st Strike');
      expect(aceStats.level).toBe(1);
      expect(aceStats.experience).toBe(0);
      expect(aceStats.nextLevelExp).toBe(100);
    });

    it('should have correct base stats for KUMA', () => {
      const kumaStats = HOLOBOT_STATS.kuma;
      expect(kumaStats).toBeDefined();
      expect(kumaStats.name).toBe('KUMA');
      expect(kumaStats.maxHealth).toBe(200);
      expect(kumaStats.attack).toBe(7);
      expect(kumaStats.defense).toBe(5);
      expect(kumaStats.speed).toBe(3);
      expect(kumaStats.intelligence).toBe(4);
      expect(kumaStats.specialMove).toBe('Sharp Claws');
    });
  });

  describe('Battle Stats Initialization', () => {
    it('should initialize battle stats correctly', () => {
      const aceStats = HOLOBOT_STATS.ace;
      const battleHolobot = new Holobot(aceStats);

      expect(battleHolobot.name).toBe('ACE');
      expect(battleHolobot.maxHealth).toBe(150);
      expect(battleHolobot.health).toBe(150);
      expect(battleHolobot.attack).toBe(8);
      expect(battleHolobot.baseDefense).toBe(6);
      expect(battleHolobot.defense).toBe(6);
      expect(battleHolobot.baseSpeed).toBe(7);
      expect(battleHolobot.speed).toBe(7);
      expect(battleHolobot.specialMove).toBe('1st Strike');
      expect(battleHolobot.level).toBe(1);
      expect(battleHolobot.hackGauge).toBe(0);
      expect(battleHolobot.maxHackGauge).toBe(100);
      expect(battleHolobot.specialAttackGauge).toBe(0);
      expect(battleHolobot.maxSpecialAttackGauge).toBe(100);
    });

    it('should initialize with default values for missing stats', () => {
      const minimalStats = {
        name: 'TEST',
        attack: 5,
        defense: 5,
        speed: 5
      };
      const battleHolobot = new Holobot(minimalStats);

      expect(battleHolobot.maxHealth).toBe(100); // Default health
      expect(battleHolobot.level).toBe(1); // Default level
      expect(battleHolobot.specialMove).toBe(''); // Default empty special move
    });
  });

  describe('Attribute Boosts', () => {
    const baseStats = HOLOBOT_STATS.ace;
    const boosts = {
      attack: 2,
      defense: 1,
      speed: 3,
      health: 20
    };

    it('should correctly apply attribute boosts', () => {
      const boostedStats = applyAttributeBoosts(baseStats, { boostedAttributes: boosts });

      expect(boostedStats.attack).toBe(baseStats.attack + boosts.attack);
      expect(boostedStats.defense).toBe(baseStats.defense + boosts.defense);
      expect(boostedStats.speed).toBe(baseStats.speed + boosts.speed);
      expect(boostedStats.maxHealth).toBe(baseStats.maxHealth + boosts.health);
    });

    it('should handle missing boost values', () => {
      const partialBoosts = {
        attack: 2,
        // defense missing
        speed: 3
        // health missing
      };
      const boostedStats = applyAttributeBoosts(baseStats, { boostedAttributes: partialBoosts });

      expect(boostedStats.attack).toBe(baseStats.attack + 2);
      expect(boostedStats.defense).toBe(baseStats.defense); // No change
      expect(boostedStats.speed).toBe(baseStats.speed + 3);
      expect(boostedStats.maxHealth).toBe(baseStats.maxHealth); // No change
    });

    it('should handle null or undefined boosts', () => {
      const boostedStats1 = applyAttributeBoosts(baseStats, null);
      expect(boostedStats1).toEqual(baseStats);

      const boostedStats2 = applyAttributeBoosts(baseStats, { boostedAttributes: null });
      expect(boostedStats2).toEqual(baseStats);
    });
  });

  describe('Battle Mechanics', () => {
    let battleHolobot: Holobot;

    beforeEach(() => {
      battleHolobot = new Holobot(HOLOBOT_STATS.ace);
    });

    it('should handle attack boosts', () => {
      battleHolobot.attackBoost = 5;
      battleHolobot.attackBoostTurns = 2;

      expect(battleHolobot.attack).toBe(HOLOBOT_STATS.ace.attack);
      // Test attack boost logic here once implemented
    });

    it('should handle defense boosts', () => {
      battleHolobot.defenseBoostTurns = 2;
      
      expect(battleHolobot.defense).toBe(HOLOBOT_STATS.ace.defense);
      // Test defense boost logic here once implemented
    });

    it('should handle speed boosts', () => {
      battleHolobot.speedBoostTurns = 2;
      
      expect(battleHolobot.speed).toBe(HOLOBOT_STATS.ace.speed);
      // Test speed boost logic here once implemented
    });

    it('should handle special attack gauge', () => {
      expect(battleHolobot.specialAttackGauge).toBe(0);
      expect(battleHolobot.specialAttackActive).toBe(false);
      
      // Test special attack activation logic here once implemented
    });
  });

  describe('Level and Experience', () => {
    it('should have correct initial level and experience values', () => {
      const aceStats = HOLOBOT_STATS.ace;
      expect(aceStats.level).toBe(1);
      expect(aceStats.experience).toBe(0);
      expect(aceStats.nextLevelExp).toBe(100);
    });

    // Add more level/experience tests once the leveling system is implemented
  });
}); 