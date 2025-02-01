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
      "Attribute Boosts Table": {
        Row: {
          attack: string
          Boost_value: number
          defense: string
          holobot_id: string
          hp: string
          id: string
          speed: string
        }
        Insert: {
          attack: string
          Boost_value: number
          defense: string
          holobot_id?: string
          hp: string
          id?: string
          speed: string
        }
        Update: {
          attack?: string
          Boost_value?: number
          defense?: string
          holobot_id?: string
          hp?: string
          id?: string
          speed?: string
        }
        Relationships: []
      }
      "Attributes Table": {
        Row: {
          attribute_type: string
          current_value: number | null
          holobot_id: string
          id: string
          max_value: number | null
        }
        Insert: {
          attribute_type: string
          current_value?: number | null
          holobot_id?: string
          id?: string
          max_value?: number | null
        }
        Update: {
          attribute_type?: string
          current_value?: number | null
          holobot_id?: string
          id?: string
          max_value?: number | null
        }
        Relationships: []
      }
      "Base Stats Table": {
        Row: {
          attack: string
          defense: string
          holobot_id: string
          hp: string
          id: string
          speed: string
        }
        Insert: {
          attack: string
          defense: string
          holobot_id?: string
          hp: string
          id?: string
          speed: string
        }
        Update: {
          attack?: string
          defense?: string
          holobot_id?: string
          hp?: string
          id?: string
          speed?: string
        }
        Relationships: []
      }
      "Battles Table": {
        Row: {
          created_at: string | null
          holobot_id: string
          id: string
          opponent: string | null
          result: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          holobot_id?: string
          id?: string
          opponent?: string | null
          result?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          holobot_id?: string
          id?: string
          opponent?: string | null
          result?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "Blueprints Table": {
        Row: {
          created_at: string
          id: string
          name: string
          required_parts: Json
          required_tokens: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          required_parts: Json
          required_tokens: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          required_parts?: Json
          required_tokens?: number
        }
        Relationships: []
      }
      game_progress: {
        Row: {
          created_at: string | null
          id: string
          losses: number | null
          quests_completed: number | null
          training_sessions: number | null
          updated_at: string | null
          user_id: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          losses?: number | null
          quests_completed?: number | null
          training_sessions?: number | null
          updated_at?: string | null
          user_id: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          losses?: number | null
          quests_completed?: number | null
          training_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          wins?: number | null
        }
        Relationships: []
      }
      holobots: {
        Row: {
          attack: number | null
          created_at: string | null
          defense: number | null
          experience: number | null
          health: number | null
          id: string
          level: number | null
          name: string
          next_level_exp: number | null
          owner_id: string
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          attack?: number | null
          created_at?: string | null
          defense?: number | null
          experience?: number | null
          health?: number | null
          id?: string
          level?: number | null
          name: string
          next_level_exp?: number | null
          owner_id: string
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          attack?: number | null
          created_at?: string | null
          defense?: number | null
          experience?: number | null
          health?: number | null
          id?: string
          level?: number | null
          name?: string
          next_level_exp?: number | null
          owner_id?: string
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "Marketplace Table": {
        Row: {
          created_at: string
          holobot_id: string
          id: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at: string
          holobot_id?: string
          id?: string
          price: number
          status: string
          user_id?: string
        }
        Update: {
          created_at?: string
          holobot_id?: string
          id?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_energy: number | null
          holos_tokens: number | null
          id: string
          last_energy_refresh: string | null
          max_daily_energy: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          daily_energy?: number | null
          holos_tokens?: number | null
          id: string
          last_energy_refresh?: string | null
          max_daily_energy?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          daily_energy?: number | null
          holos_tokens?: number | null
          id?: string
          last_energy_refresh?: string | null
          max_daily_energy?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      "Tokens Table": {
        Row: {
          amount: number
          created_at: string
          id: string
          purpose: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          purpose: string
          type: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          purpose?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      "User Table": {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          password_hash: string
          username: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          username?: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web3_users: {
        Row: {
          created_at: string | null
          id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "nft_holder"
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
