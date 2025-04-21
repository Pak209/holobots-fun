```typescript
import { Holobot, BattleEffect, BattleState, BattleAction, BattleResult } from '@/types';
import { API_URL } from '@/constants/config';

class BattleService {
  private socket: WebSocket | null = null;
  private battleState: BattleState | null = null;
  private onStateChange: ((state: BattleState) => void) | null = null;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    if (typeof window !== 'undefined') {
      this.socket = new WebSocket(`${API_URL.replace('http', 'ws')}/battles/ws`);
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'battle_state') {
          this.battleState = data.state;
          this.onStateChange?.(data.state);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Battle WebSocket error:', error);
      };
    }
  }

  public subscribeToBattleUpdates(callback: (state: BattleState) => void) {
    this.onStateChange = callback;
  }

  public async initializeBattle(battleId: string): Promise<BattleState> {
    try {
      const response = await fetch(`${API_URL}/battles/${battleId}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to initialize battle');
      
      const battleState = await response.json();
      this.battleState = battleState;
      return battleState;
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      throw error;
    }
  }

  public async performAction(battleId: string, action: BattleAction): Promise<BattleEffect> {
    try {
      const response = await fetch(`${API_URL}/battles/${battleId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      
      if (!response.ok) throw new Error('Failed to perform battle action');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to perform battle action:', error);
      throw error;
    }
  }

  public async useHack(battleId: string, hackType: string): Promise<BattleEffect> {
    try {
      const response = await fetch(`${API_URL}/battles/${battleId}/hack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: hackType }),
      });
      
      if (!response.ok) throw new Error('Failed to use hack');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to use hack:', error);
      throw error;
    }
  }

  public async endBattle(battleId: string): Promise<BattleResult> {
    try {
      const response = await fetch(`${API_URL}/battles/${battleId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to end battle');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to end battle:', error);
      throw error;
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const battleService = new BattleService();
```