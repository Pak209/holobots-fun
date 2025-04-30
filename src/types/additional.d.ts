
// Additional type definitions to avoid TypeScript errors

// Declare global types for the application
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Extend existing types
declare module '@/types/holobot' {
  interface HolobotStats {
    name: string;
    level?: number;
    maxHealth?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    specialMove?: string;
  }
}

// This empty export is required to make this file a module
export {};
