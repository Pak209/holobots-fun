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
          created_at: string | null
          daily_energy: number
          gacha_tickets: number | null
          holos_tokens: number | null
          id: string
          last_daily_pull: string | null
          last_energy_refresh: string | null
          losses: number | null
          max_daily_energy: number
          username: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          daily_energy?: number
          gacha_tickets?: number | null
          holos_tokens?: number | null
          id: string
          last_daily_pull?: string | null
          last_energy_refresh?: string | null
          losses?: number | null
          max_daily_energy?: number
          username: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          daily_energy?: number
          gacha_tickets?: number | null
          holos_tokens?: number | null
          id?: string
          last_daily_pull?: string | null
          last_energy_refresh?: string | null
          losses?: number | null
          max_daily_energy?: number
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
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
