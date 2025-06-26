import { UserProfile } from '@/types/user';

export const DAILY_FREE_TICKETS = 3;

/**
 * Check if a user needs their daily async battle tickets refreshed
 * Returns true if tickets should be refreshed (new day)
 */
export function shouldRefreshDailyTickets(user: UserProfile): boolean {
  if (!user.last_async_ticket_refresh) {
    return true; // First time, should refresh
  }
  
  const lastRefresh = new Date(user.last_async_ticket_refresh);
  const now = new Date();
  
  // Check if it's a new day (different calendar day)
  const lastRefreshDate = lastRefresh.toDateString();
  const currentDate = now.toDateString();
  
  return lastRefreshDate !== currentDate;
}

/**
 * Calculate how many tickets a user should have after daily refresh
 * If it's a new day, user gets 3 free tickets added to their current total (max benefits from purchasing)
 */
export function calculateRefreshedTickets(user: UserProfile): number {
  const currentTickets = user.async_battle_tickets || 0;
  
  if (shouldRefreshDailyTickets(user)) {
    // Add 3 free daily tickets to current total
    return currentTickets + DAILY_FREE_TICKETS;
  }
  
  return currentTickets;
}

/**
 * Get the refresh data for updating user profile
 */
export function getTicketRefreshData(): { 
  async_battle_tickets: number;
  last_async_ticket_refresh: string;
} {
  return {
    async_battle_tickets: DAILY_FREE_TICKETS,
    last_async_ticket_refresh: new Date().toISOString()
  };
}

/**
 * Get time until next daily refresh
 */
export function getTimeUntilNextRefresh(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to midnight
  
  const timeDiff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if user has enough tickets for a battle
 */
export function canAffordBattle(user: UserProfile): boolean {
  return (user.async_battle_tickets || 0) > 0;
}

/**
 * Deduct a ticket from user's total
 */
export function deductTicket(currentTickets: number): number {
  return Math.max(0, currentTickets - 1);
} 