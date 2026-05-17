export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          date: string
          guest_email: string | null
          guest_name: string
          guest_phone: string
          id: number
          note: string | null
          party_size: number
          restaurant_id: number
          status: string
          time_slot: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          guest_email?: string | null
          guest_name: string
          guest_phone: string
          id?: number
          note?: string | null
          party_size: number
          restaurant_id: number
          status?: string
          time_slot: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string
          id?: number
          note?: string | null
          party_size?: number
          restaurant_id?: number
          status?: string
          time_slot?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_logs: {
        Row: {
          id: number
          ran_at: string
          source: string
          records_fetched: number
          records_upserted: number
          status: string
          error_message: string | null
          duration_ms: number | null
        }
        Insert: {
          id?: number
          ran_at?: string
          source: string
          records_fetched?: number
          records_upserted?: number
          status?: string
          error_message?: string | null
          duration_ms?: number | null
        }
        Update: {
          id?: number
          ran_at?: string
          source?: string
          records_fetched?: number
          records_upserted?: number
          status?: string
          error_message?: string | null
          duration_ms?: number | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          avg_price: number | null
          category: string
          city: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          district: string | null
          gmap_place_id: string | null
          id: number
          lat: number | null
          lng: number | null
          name: string
          open_hours: Json | null
          phone: string | null
          rating: number | null
          review_count: number | null
        }
        Insert: {
          address?: string | null
          avg_price?: number | null
          category: string
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          gmap_place_id?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name: string
          open_hours?: Json | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
        }
        Update: {
          address?: string | null
          avg_price?: number | null
          category?: string
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          gmap_place_id?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string
          open_hours?: Json | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string
          id: number
          is_tourist: boolean | null
          rating: number
          restaurant_id: number
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          created_at?: string
          id?: number
          is_tourist?: boolean | null
          rating: number
          restaurant_id: number
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string | null
          created_at?: string
          id?: number
          is_tourist?: boolean | null
          rating?: number
          restaurant_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
