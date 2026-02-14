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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_impressions: {
        Row: {
          advertisement_id: string
          content_link_id: string
          created_at: string
          id: string
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          advertisement_id: string
          content_link_id: string
          created_at?: string
          id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          advertisement_id?: string
          content_link_id?: string
          created_at?: string
          id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_content_link_id_fkey"
            columns: ["content_link_id"]
            isOneToOne: false
            referencedRelation: "content_links"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_categories: {
        Row: {
          advertisement_id: string
          category_id: string
          id: string
        }
        Insert: {
          advertisement_id: string
          category_id: string
          id?: string
        }
        Update: {
          advertisement_id?: string
          category_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_categories_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisement_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          ad_type: string
          advertiser_id: string
          budget: number
          click_count: number
          click_url: string
          created_at: string
          html_content: string | null
          id: string
          image_url: string | null
          is_active: boolean
          spent: number
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          ad_type?: string
          advertiser_id: string
          budget?: number
          click_count?: number
          click_url: string
          created_at?: string
          html_content?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          spent?: number
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          ad_type?: string
          advertiser_id?: string
          budget?: number
          click_count?: number
          click_url?: string
          created_at?: string
          html_content?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          spent?: number
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisers: {
        Row: {
          company_name: string
          contact_email: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      content_clicks: {
        Row: {
          advertisement_id: string | null
          content_link_id: string
          created_at: string
          id: string
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          advertisement_id?: string | null
          content_link_id: string
          created_at?: string
          id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          advertisement_id?: string | null
          content_link_id?: string
          created_at?: string
          id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_clicks_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_clicks_content_link_id_fkey"
            columns: ["content_link_id"]
            isOneToOne: false
            referencedRelation: "content_links"
            referencedColumns: ["id"]
          },
        ]
      }
      content_link_categories: {
        Row: {
          category_id: string
          content_link_id: string
          id: string
        }
        Insert: {
          category_id: string
          content_link_id: string
          id?: string
        }
        Update: {
          category_id?: string
          content_link_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_link_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_link_categories_content_link_id_fkey"
            columns: ["content_link_id"]
            isOneToOne: false
            referencedRelation: "content_links"
            referencedColumns: ["id"]
          },
        ]
      }
      content_links: {
        Row: {
          click_count: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          original_url: string
          provider_id: string
          short_code: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          click_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          original_url: string
          provider_id: string
          short_code: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          click_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          original_url?: string
          provider_id?: string
          short_code?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_links_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "content_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_providers: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          organization_name: string
          updated_at: string
          user_id: string
          website_domain: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          organization_name: string
          updated_at?: string
          user_id: string
          website_domain?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          organization_name?: string
          updated_at?: string
          user_id?: string
          website_domain?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_advertisement: {
        Args: never
        Returns: {
          ad_type: string
          advertiser_id: string
          budget: number
          click_count: number
          click_url: string
          created_at: string
          html_content: string | null
          id: string
          image_url: string | null
          is_active: boolean
          spent: number
          title: string
          updated_at: string
          view_count: number
        }
        SetofOptions: {
          from: "*"
          to: "advertisements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_random_advertisement_for_link: {
        Args: { p_content_link_id: string }
        Returns: {
          ad_type: string
          advertiser_id: string
          budget: number
          click_count: number
          click_url: string
          created_at: string
          html_content: string | null
          id: string
          image_url: string | null
          is_active: boolean
          spent: number
          title: string
          updated_at: string
          view_count: number
        }
        SetofOptions: {
          from: "*"
          to: "advertisements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
