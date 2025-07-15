export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      players: {
        Row: {
          assists: number | null
          cost_percentage: number | null
          created_at: string | null
          fmv: number | null
          goals: number | null
          goals_conceded: number | null
          id: string
          is_favorite: boolean | null
          malus: number | null
          name: string
          ownership: number | null
          penalties_saved: number | null
          plus_categories: Database["public"]["Enums"]["plus_category"][] | null
          role: Database["public"]["Enums"]["specific_role"] | null
          role_category: Database["public"]["Enums"]["player_role"]
          surname: string
          team: Database["public"]["Enums"]["team_name"] | null
          tier: string | null
          updated_at: string | null
          user_id: string
          x_a: number | null
          x_g: number | null
          x_p: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          cost_percentage?: number | null
          created_at?: string | null
          fmv?: number | null
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          is_favorite?: boolean | null
          malus?: number | null
          name: string
          ownership?: number | null
          penalties_saved?: number | null
          plus_categories?:
            | Database["public"]["Enums"]["plus_category"][]
            | null
          role?: Database["public"]["Enums"]["specific_role"] | null
          role_category: Database["public"]["Enums"]["player_role"]
          surname: string
          team?: Database["public"]["Enums"]["team_name"] | null
          tier?: string | null
          updated_at?: string | null
          user_id: string
          x_a?: number | null
          x_g?: number | null
          x_p?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          cost_percentage?: number | null
          created_at?: string | null
          fmv?: number | null
          goals?: number | null
          goals_conceded?: number | null
          id?: string
          is_favorite?: boolean | null
          malus?: number | null
          name?: string
          ownership?: number | null
          penalties_saved?: number | null
          plus_categories?:
            | Database["public"]["Enums"]["plus_category"][]
            | null
          role?: Database["public"]["Enums"]["specific_role"] | null
          role_category?: Database["public"]["Enums"]["player_role"]
          surname?: string
          team?: Database["public"]["Enums"]["team_name"] | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string
          x_a?: number | null
          x_g?: number | null
          x_p?: number | null
          yellow_cards?: number | null
        }
        Relationships: []
      }
      realtime_selections: {
        Row: {
          created_at: string
          credits: number
          id: string
          player_name: string
          player_surname: string
          player_team: string | null
          position_slot: number
          role_category: Database["public"]["Enums"]["player_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          player_name: string
          player_surname: string
          player_team?: string | null
          position_slot: number
          role_category: Database["public"]["Enums"]["player_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          player_name?: string
          player_surname?: string
          player_team?: string | null
          position_slot?: number
          role_category?: Database["public"]["Enums"]["player_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      squad_selections: {
        Row: {
          created_at: string
          id: string
          player_id: string
          position_slot: number
          role_category: Database["public"]["Enums"]["player_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          position_slot: number
          role_category: Database["public"]["Enums"]["player_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          position_slot?: number
          role_category?: Database["public"]["Enums"]["player_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      player_role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante"
      plus_category:
        | "Under 21"
        | "Rigorista"
        | "Calci piazzati"
        | "Assistman"
        | "Goleador"
        | "Under 19"
        | "Pararigori"
      specific_role:
        | "Portiere"
        | "Difensore centrale"
        | "Esterno offensivo"
        | "Braccetto"
        | "Mediano"
        | "Regista"
        | "Mezzala"
        | "Trequartista"
        | "Ala offensiva"
        | "Attaccante centrale"
        | "Seconda punta"
        | "Mezzapunta"
      team_name:
        | "Atalanta"
        | "Bologna"
        | "Cagliari"
        | "Como"
        | "Cremonese"
        | "Fiorentina"
        | "Genoa"
        | "Hellas Verona"
        | "Inter"
        | "Juventus"
        | "Lazio"
        | "Lecce"
        | "Milan"
        | "Napoli"
        | "Parma"
        | "Pisa"
        | "Roma"
        | "Sassuolo"
        | "Torino"
        | "Udinese"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      player_role: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
      plus_category: [
        "Under 21",
        "Rigorista",
        "Calci piazzati",
        "Assistman",
        "Goleador",
        "Under 19",
        "Pararigori",
      ],
      specific_role: [
        "Portiere",
        "Difensore centrale",
        "Esterno offensivo",
        "Braccetto",
        "Mediano",
        "Regista",
        "Mezzala",
        "Trequartista",
        "Ala offensiva",
        "Attaccante centrale",
        "Seconda punta",
        "Mezzapunta",
      ],
      team_name: [
        "Atalanta",
        "Bologna",
        "Cagliari",
        "Como",
        "Cremonese",
        "Fiorentina",
        "Genoa",
        "Hellas Verona",
        "Inter",
        "Juventus",
        "Lazio",
        "Lecce",
        "Milan",
        "Napoli",
        "Parma",
        "Pisa",
        "Roma",
        "Sassuolo",
        "Torino",
        "Udinese",
      ],
    },
  },
} as const
