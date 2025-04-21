/**
 * Generates a UUID v4
 * @returns {string} A UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Formats a date to a readable string
 * @param {Date} date The date to format
 * @returns {string} A formatted date string
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculates the win rate percentage
 * @param {number} wins Number of wins
 * @param {number} losses Number of losses
 * @returns {number} Win rate percentage
 */
export function calculateWinRate(wins: number, losses: number): number {
  if (wins === 0 && losses === 0) return 0;
  return Math.round((wins / (wins + losses)) * 100);
}

/**
 * Formats a number with commas for thousands
 * @param {number} num The number to format
 * @returns {string} A formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculates the experience progress
 * @param {number} currentXp Current experience points
 * @param {number} level Current level
 * @returns {object} An object containing currentXp, requiredXp, and percentage
 */
export const getExperienceProgress = (currentXp: number, level: number) => {
  const requiredXp = calculateExperience(level);
  return {
    currentXp,
    requiredXp,
    percentage: (currentXp / requiredXp) * 100
  };
};