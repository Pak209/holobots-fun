export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      battle_participants: {
        Row: {
          battle_id: number | null
          holobot_id: number | null
          id: number
        }
        Insert: {
          battle_id?: number | null
          holobot_id?: number | null
          id?: never
        }
        Update: {
          battle_id?: number | null
          holobot_id?: number | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_holobot_id_fkey"
            columns: ["holobot_id"]
            isOneToOne: false
            referencedRelation: "holobots"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          created_at: string | null
          id: number
          participant_ids: number[] | null
          rewards: Json | null
          winner_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          participant_ids?: number[] | null
          rewards?: Json | null
          winner_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          participant_ids?: number[] | null
          rewards?: Json | null
          winner_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "holobots"
            referencedColumns: ["id"]
          },
        ]
      }
      cooldowns: {
        Row: {
          energy_refill_time: string | null
          id: number
          user_id: number | null
        }
        Insert: {
          energy_refill_time?: string | null
          id?: never
          user_id?: number | null
        }
        Update: {
          energy_refill_time?: string | null
          id?: never
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      holobot_progression: {
        Row: {
          battle_id: number | null
          holobot_id: number | null
          id: number
          level_after_battle: number | null
          xp_gained: number | null
        }
        Insert: {
          battle_id?: number | null
          holobot_id?: number | null
          id?: never
          level_after_battle?: number | null
          xp_gained?: number | null
        }
        Update: {
          battle_id?: number | null
          holobot_id?: number | null
          id?: never
          level_after_battle?: number | null
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holobot_progression_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holobot_progression_holobot_id_fkey"
            columns: ["holobot_id"]
            isOneToOne: false
            referencedRelation: "holobots"
            referencedColumns: ["id"]
          },
        ]
      }
      holobots: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: number
          level: number | null
          name: string | null
          owner_id: number | null
          parts: number | null
          rank: number | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: never
          level?: number | null
          name?: string | null
          owner_id?: number | null
          parts?: number | null
          rank?: number | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: never
          level?: number | null
          name?: string | null
          owner_id?: number | null
          parts?: number | null
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holobots_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holobots_parts_fkey"
            columns: ["parts"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace: {
        Row: {
          buyer_id: number | null
          created_at: string | null
          id: number
          item_id: number | null
          price: number | null
          seller_id: number | null
          status: string | null
          transaction_status: string | null
        }
        Insert: {
          buyer_id?: number | null
          created_at?: string | null
          id?: never
          item_id?: number | null
          price?: number | null
          seller_id?: number | null
          status?: string | null
          transaction_status?: string | null
        }
        Update: {
          buyer_id?: number | null
          created_at?: string | null
          id?: never
          item_id?: number | null
          price?: number | null
          seller_id?: number | null
          status?: string | null
          transaction_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          blueprint_required: boolean | null
          id: number
          name: string | null
          owner_id: number | null
          tier: number | null
          type: string | null
        }
        Insert: {
          blueprint_required?: boolean | null
          id?: never
          name?: string | null
          owner_id?: number | null
          tier?: number | null
          type?: string | null
        }
        Update: {
          blueprint_required?: boolean | null
          id?: never
          name?: string | null
          owner_id?: number | null
          tier?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
          player_rank: Database["public"]["Enums"]["player_rank_type"] | null
          prestige_count: number | null
          rank_skips: number | null
          sync_points: number | null
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
          player_rank?: Database["public"]["Enums"]["player_rank_type"] | null
          prestige_count?: number | null
          rank_skips?: number | null
          sync_points?: number | null
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
          player_rank?: Database["public"]["Enums"]["player_rank_type"] | null
          prestige_count?: number | null
          rank_skips?: number | null
          sync_points?: number | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          difficulty: string | null
          energy_cost: number | null
          id: number
          rewards: Json | null
          zone: string | null
        }
        Insert: {
          difficulty?: string | null
          energy_cost?: number | null
          id?: never
          rewards?: Json | null
          zone?: string | null
        }
        Update: {
          difficulty?: string | null
          energy_cost?: number | null
          id?: never
          rewards?: Json | null
          zone?: string | null
        }
        Relationships: []
      }
      training_rewards: {
        Row: {
          created_at: string | null
          exp: number
          holobot_id: number
          holos: number
          id: string
          items: Json | null
          sync_points: number
        }
        Insert: {
          created_at?: string | null
          exp: number
          holobot_id: number
          holos: number
          id?: string
          items?: Json | null
          sync_points: number
        }
        Update: {
          created_at?: string | null
          exp?: number
          holobot_id?: number
          holos?: number
          id?: string
          items?: Json | null
          sync_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_rewards_holobot_id_fkey"
            columns: ["holobot_id"]
            isOneToOne: false
            referencedRelation: "holobots"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          id: number
          timestamp: string | null
          type: string | null
          user_id: number | null
        }
        Insert: {
          amount?: number | null
          id?: never
          timestamp?: string | null
          type?: string | null
          user_id?: number | null
        }
        Update: {
          amount?: number | null
          id?: never
          timestamp?: string | null
          type?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          energy: number | null
          id: number
          sync_points: number | null
          tokens: number | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          energy?: number | null
          id?: never
          sync_points?: number | null
          tokens?: number | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          energy?: number | null
          id?: never
          sync_points?: number | null
          tokens?: number | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_sync_points: {
        Args: { user_id: string; points: number }
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_player_rank: {
        Args: { user_id: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      player_rank_type:
        | "Rookie"
        | "Scout"
        | "Champion"
        | "Elite"
        | "Legend"
        | "Mythic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      player_rank_type: [
        "Rookie",
        "Scout",
        "Champion",
        "Elite",
        "Legend",
        "Mythic",
      ],
    },
  },
} as const
