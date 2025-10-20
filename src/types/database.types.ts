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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string | null
          created_at: string
          deal_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_tags: {
        Row: {
          created_at: string
          deal_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          deal_id?: string
          tag_id?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_tags_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          address: string | null
          comment_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          discounted_price: number
          downvotes: number | null
          geom: unknown | null
          id: string
          original_price: number | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          address?: string | null
          comment_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discounted_price: number
          downvotes?: number | null
          geom?: unknown | null
          id?: string
          original_price?: number | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          address?: string | null
          comment_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discounted_price?: number
          downvotes?: number | null
          geom?: unknown | null
          id?: string
          original_price?: number | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      dummy: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          deal_id: string
          description: string | null
          id: string
          reason: string | null
          reporter_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          description?: string | null
          id?: string
          reason?: string | null
          reporter_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          description?: string | null
          id?: string
          reason?: string | null
          reporter_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey" 
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"  
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          user_id: string | null
          vote_type: number | null
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          user_id?: string | null
          vote_type?: number | null
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          user_id?: string | null
          vote_type?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_deals: {
        Args: { distance_m?: number; user_lat: number; user_lon: number }
        Returns: {
          address: string
          comment_count: number
          created_at: string
          description: string
          discounted_price: number
          distance: number
          downvotes: number
          id: string
          latitude: number
          longitude: number
          original_price: number
          title: string
          updated_at: string
          upvotes: number
        }[]
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
