export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          arena_passes: number | null
          blueprints: Json | null
          created_at: string | null
          daily_energy: number
          energy_refills: number | null
          exp_boosters: number | null
          gacha_tickets: number | null
          holobots: Json | null
          holos_tokens: number | null
          id: string
          last_daily_pull: string | null
          last_energy_refresh: string | null
          losses: number | null
          max_daily_energy: number
          rank_skips: number | null
          username: string
          wins: number | null
        }
        Insert: {
          arena_passes?: number | null
          blueprints?: Json | null
          created_at?: string | null
          daily_energy?: number
          energy_refills?: number | null
          exp_boosters?: number | null
          gacha_tickets?: number | null
          holobots?: Json | null
          holos_tokens?: number | null
          id: string
          last_daily_pull?: string | null
          last_energy_refresh?: string | null
          losses?: number | null
          max_daily_energy?: number
          rank_skips?: number | null
          username: string
          wins?: number | null
        }
        Update: {
          arena_passes?: number | null
          blueprints?: Json | null
          created_at?: string | null
          daily_energy?: number
          energy_refills?: number | null
          exp_boosters?: number | null
          gacha_tickets?: number | null
          holobots?: Json | null
          holos_tokens?: number | null
          id?: string
          last_daily_pull?: string | null
          last_energy_refresh?: string | null
          losses?: number | null
          max_daily_energy?: number
          rank_skips?: number | null
          username?: string
          wins?: number | null
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]