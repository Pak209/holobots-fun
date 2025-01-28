import { HolobotStats } from "@/types/holobot";

export class Holobot {
    name: string;
    maxHealth: number;
    health: number;
    attack: number;
    baseDefense: number;
    defense: number;
    baseSpeed: number;
    speed: number;
    specialMove: string;
    level: number;
    hackGauge: number;
    maxHackGauge: number;
    attackBoost: number;
    specialAttackActive: boolean;
    attackBoostTurns: number;
    defenseBoostTurns: number;
    speedBoostTurns: number;
    specialAttackGauge: number;
    maxSpecialAttackGauge: number;

    constructor(stats: HolobotStats) {
        this.name = stats.name;
        this.maxHealth = stats.maxHealth;
        this.health = stats.maxHealth;
        this.attack = stats.attack;
        this.baseDefense = stats.defense;
        this.defense = stats.defense;
        this.baseSpeed = stats.speed;
        this.speed = stats.speed;
        this.specialMove = stats.specialMove;
        this.level = stats.level;
        this.hackGauge = 0;
        this.maxHackGauge = 100;
        this.attackBoost = 0;
        this.specialAttackActive = false;
        this.attackBoostTurns = 0;
        this.defenseBoostTurns = 0;
        this.speedBoostTurns = 0;
        this.specialAttackGauge = 0;
        this.maxSpecialAttackGauge = 100;
    }

    increaseHackGauge(amount: number) {
        this.hackGauge = Math.min(this.maxHackGauge, this.hackGauge + amount);
    }

    increaseSpecialAttackGauge(amount: number) {
        this.specialAttackGauge = Math.min(this.maxSpecialAttackGauge, this.specialAttackGauge + amount);
    }

    getStatusText() {
        return `HP: ${this.health.toFixed(1)}/${this.maxHealth} | Hack: ${this.hackGauge}%`;
    }

    calculateEvasionChance(attacker: Holobot) {
        const speedDifference = this.speed - attacker.speed;
        const baseEvasion = 0.05;
        const speedBonus = Math.max(0, speedDifference * 0.015);
        return Math.min(0.40, baseEvasion + speedBonus);
    }

    calculateCounterChance(attacker: Holobot) {
        const defenseBonus = this.defense * 0.025;
        const speedBonus = this.speed * 0.02;
        return Math.min(0.45, defenseBonus + speedBonus);
    }

    calculateCounterDamage() {
        const baseCounter = this.attack * 0.8;
        const defenseBonus = this.defense * 0.3;
        const speedBonus = this.speed * 0.2;
        return baseCounter + defenseBonus + speedBonus;
    }

    calculateAttack(opponent: Holobot) {
        let damage = (this.attack + this.attackBoost) - (opponent.defense * 0.5);
        
        if (this.specialAttackActive) {
            damage *= 2.5;
            this.specialAttackActive = false;
        }
        
        return Math.max(0, damage);
    }

    useSpecial(opponent: Holobot): { type: string; value: number; message: string } | null {
        if (this.specialAttackGauge < 50) return null;

        let effect = {
            type: '',
            value: 0,
            message: ''
        };

        switch(this.specialMove) {
            case "1st Strike":
                if (this.specialAttackGauge >= 100) {
                    this.attackBoost = 5;
                    effect = {
                        type: 'boost',
                        value: 5,
                        message: `${this.name} boosts attack power!`
                    };
                } else {
                    this.attackBoost = 2.5;
                    effect = {
                        type: 'boost',
                        value: 2.5,
                        message: `${this.name} partially boosts attack power!`
                    };
                }
                break;
            case "Sharp Claws":
                const bleedDamage = this.specialAttackGauge >= 100 ? 
                    Math.floor(this.attack * 0.3) : 
                    Math.floor(this.attack * 0.15);
                opponent.health -= bleedDamage;
                effect = {
                    type: 'bleed',
                    value: bleedDamage,
                    message: `${this.name} causes ${bleedDamage} bleed damage!`
                };
                break;
            case "Smokescreen":
                if (this.specialAttackGauge >= 100) {
                    opponent.defense -= 2;
                    effect = {
                        type: 'debuff',
                        value: 2,
                        message: `${this.name} reduces ${opponent.name}'s defense!`
                    };
                } else {
                    opponent.defense -= 1;
                    effect = {
                        type: 'debuff',
                        value: 1,
                        message: `${this.name} partially reduces ${opponent.name}'s defense!`
                    };
                }
                break;
        }

        this.specialAttackGauge = this.specialAttackGauge >= 100 ? 0 : this.specialAttackGauge - 50;
        return effect;
    }

    hackEffect(effectType: string): { type: string; value: number; message: string } {
        let effect = {
            type: effectType,
            value: 0,
            message: ''
        };

        switch(effectType) {
            case 'boost':
                this.attackBoost += 15;
                this.attackBoostTurns = 3;
                effect.value = 15;
                effect.message = `${this.name}'s attack boosted for 3 turns! (+15 ATK)`;
                break;
            case 'heal':
                const healAmount = Math.floor(this.maxHealth * 0.4);
                this.health = Math.min(this.maxHealth, this.health + healAmount);
                effect.value = healAmount;
                effect.message = `${this.name} regains ${healAmount} HP!`;
                break;
            case 'special_attack':
                this.specialAttackActive = true;
                this.attackBoost += 10;
                effect.value = this.attack;
                effect.message = `${this.name} charges up for a devastating attack! (250% damage + 10 ATK)`;
                break;
            case 'raise_defense':
                const defenseBoost = Math.floor(this.baseDefense * 0.3);
                this.defense += defenseBoost;
                this.defenseBoostTurns = 2;
                effect.value = defenseBoost;
                effect.message = `${this.name}'s defense increased for 2 turns! (+${defenseBoost} DEF)`;
                break;
            case 'raise_speed':
                const speedBoost = Math.floor(this.baseSpeed * 0.4);
                this.speed += speedBoost;
                this.speedBoostTurns = 2;
                effect.value = speedBoost;
                effect.message = `${this.name}'s speed increased for 2 turns! (+${speedBoost} SPD)`;
                break;
        }
        return effect;
    }

    isAlive() {
        return this.health > 0;
    }

    updateBoosts(): string | null {
        if (this.attackBoostTurns > 0) {
            this.attackBoostTurns--;
            if (this.attackBoostTurns === 0) {
                this.attackBoost = 0;
                return `${this.name}'s attack boost has worn off!`;
            }
        }

        if (this.defenseBoostTurns > 0) {
            this.defenseBoostTurns--;
            if (this.defenseBoostTurns === 0) {
                this.defense = this.baseDefense;
                return `${this.name}'s defense boost has worn off!`;
            }
        }

        if (this.speedBoostTurns > 0) {
            this.speedBoostTurns--;
            if (this.speedBoostTurns === 0) {
                this.speed = this.baseSpeed;
                return `${this.name}'s speed boost has worn off!`;
            }
        }

        return null;
    }

    triggerSpecial(opponent: Holobot) {
        return this.useSpecial(opponent);
    }

    decideSpecial(opponent: Holobot) {
        if (this.specialAttackGauge >= 100) {
            return this.useSpecial(opponent);
        } else if (this.specialAttackGauge >= 50 && this.health < this.maxHealth * 0.5) {
            return this.useSpecial(opponent);
        }
        return null;
    }
}

export function initializeHolobot(stats: HolobotStats): Holobot {
    return new Holobot(stats);
}