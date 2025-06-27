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
      accounts: {
        Row: {
          account_number: string
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          account_number: string
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          account_number?: string
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          advertisement_id: string
          content_link_id: string
          id: string
          user_agent: string | null
          viewed_at: string | null
          visitor_ip: string | null
        }
        Insert: {
          advertisement_id: string
          content_link_id: string
          id?: string
          user_agent?: string | null
          viewed_at?: string | null
          visitor_ip?: string | null
        }
        Update: {
          advertisement_id?: string
          content_link_id?: string
          id?: string
          user_agent?: string | null
          viewed_at?: string | null
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
      advertisements: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          advertiser_id: string
          click_url: string
          clicks_count: number | null
          created_at: string | null
          html_content: string | null
          id: string
          image_url: string | null
          status: Database["public"]["Enums"]["ad_status"]
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          ad_type?: Database["public"]["Enums"]["ad_type"]
          advertiser_id: string
          click_url: string
          clicks_count?: number | null
          created_at?: string | null
          html_content?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          ad_type?: Database["public"]["Enums"]["ad_type"]
          advertiser_id?: string
          click_url?: string
          clicks_count?: number | null
          created_at?: string | null
          html_content?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          title?: string
          updated_at?: string | null
          views_count?: number | null
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
          contact_email: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          developer_id: string
          id: string
          is_active: boolean | null
          is_public: boolean | null
          model: string | null
          name: string
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          developer_id: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          model?: string | null
          name: string
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          model?: string | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_clicks: {
        Row: {
          advertisement_id: string | null
          clicked_at: string | null
          content_link_id: string
          id: string
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          advertisement_id?: string | null
          clicked_at?: string | null
          content_link_id: string
          id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          advertisement_id?: string | null
          clicked_at?: string | null
          content_link_id?: string
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
      content_links: {
        Row: {
          clicks_count: number | null
          content_provider_id: string
          created_at: string | null
          description: string | null
          id: string
          original_url: string
          short_code: string
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          clicks_count?: number | null
          content_provider_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          original_url: string
          short_code: string
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          clicks_count?: number | null
          content_provider_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          original_url?: string
          short_code?: string
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_links_content_provider_id_fkey"
            columns: ["content_provider_id"]
            isOneToOne: false
            referencedRelation: "content_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_providers: {
        Row: {
          contact_email: string
          created_at: string | null
          id: string
          organization_name: string
          updated_at: string | null
          user_id: string
          website_domain: string
        }
        Insert: {
          contact_email: string
          created_at?: string | null
          id?: string
          organization_name: string
          updated_at?: string | null
          user_id: string
          website_domain: string
        }
        Update: {
          contact_email?: string
          created_at?: string | null
          id?: string
          organization_name?: string
          updated_at?: string | null
          user_id?: string
          website_domain?: string
        }
        Relationships: []
      }
      conversation_invites: {
        Row: {
          conversation_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invite_token: string
          invitee_email: string
          inviter_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_token?: string
          invitee_email: string
          inviter_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_token?: string
          invitee_email?: string
          inviter_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_invites_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_agent_id: string | null
          avatar_url: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          ai_agent_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          ai_agent_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_balances: {
        Row: {
          account_number: string
          amount: number
          balance_date: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          balance_date: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          balance_date?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_balances_account_number_fkey"
            columns: ["account_number"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_number"]
          },
        ]
      }
      meeting_invites: {
        Row: {
          available_slots: Json
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          inviter_name: string
          title: string
        }
        Insert: {
          available_slots: Json
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          inviter_name: string
          title: string
        }
        Update: {
          available_slots?: Json
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          inviter_name?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_ai_response: boolean | null
          message_type: string | null
          metadata: Json | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_ai_response?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_ai_response?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migraine_entries: {
        Row: {
          amount: string
          cause: string
          created_at: string
          id: string
          timestamp: string
          user_id: string
          when: string
          where: string
        }
        Insert: {
          amount: string
          cause: string
          created_at?: string
          id?: string
          timestamp?: string
          user_id: string
          when: string
          where: string
        }
        Update: {
          amount?: string
          cause?: string
          created_at?: string
          id?: string
          timestamp?: string
          user_id?: string
          when?: string
          where?: string
        }
        Relationships: []
      }
      participant_responses: {
        Row: {
          created_at: string
          id: string
          invite_id: string
          participant_initials: string
          participant_name: string
          selected_slots: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_id: string
          participant_initials: string
          participant_name: string
          selected_slots: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_id?: string
          participant_initials?: string
          participant_name?: string
          selected_slots?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_responses_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "meeting_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_developer: boolean | null
          name: string | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_developer?: boolean | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_developer?: boolean | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scenes: {
        Row: {
          created_at: string
          generation_job_id: string | null
          id: string
          prompt: string
          scene_order: number
          settings: Json
          speech: string | null
          status: string
          story_id: string
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          generation_job_id?: string | null
          id?: string
          prompt: string
          scene_order: number
          settings: Json
          speech?: string | null
          status?: string
          story_id: string
          title?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          generation_job_id?: string | null
          id?: string
          prompt?: string
          scene_order?: number
          settings?: Json
          speech?: string | null
          status?: string
          story_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      signed_diplomas: {
        Row: {
          blockchain_id: string
          content_hash: string
          created_at: string
          diploma_css: string
          diploma_html: string
          diploma_url: string | null
          diplomator_seal: string
          id: string
          institution_name: string
          issuer_id: string
          recipient_name: string
          signature: string
          updated_at: string
          verification_url: string
        }
        Insert: {
          blockchain_id: string
          content_hash: string
          created_at?: string
          diploma_css: string
          diploma_html: string
          diploma_url?: string | null
          diplomator_seal: string
          id?: string
          institution_name: string
          issuer_id: string
          recipient_name: string
          signature: string
          updated_at?: string
          verification_url: string
        }
        Update: {
          blockchain_id?: string
          content_hash?: string
          created_at?: string
          diploma_css?: string
          diploma_html?: string
          diploma_url?: string | null
          diplomator_seal?: string
          id?: string
          institution_name?: string
          issuer_id?: string
          recipient_name?: string
          signature?: string
          updated_at?: string
          verification_url?: string
        }
        Relationships: []
      }
      standard_accounts: {
        Row: {
          account_number: string
          account_type: string | null
          created_at: string | null
          name: string
        }
        Insert: {
          account_number: string
          account_type?: string | null
          created_at?: string | null
          name: string
        }
        Update: {
          account_number?: string
          account_type?: string | null
          created_at?: string | null
          name?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_entries: {
        Row: {
          account_number: string
          amount: number
          created_at: string
          entry_number: number
          id: string
          transaction_date: string
          transaction_number: number
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          created_at?: string
          entry_number: number
          id?: string
          transaction_date: string
          transaction_number: number
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          created_at?: string
          entry_number?: number
          id?: string
          transaction_date?: string
          transaction_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_entries_account_number_fkey"
            columns: ["account_number"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_number"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_conversation_invite: {
        Args: { invite_token_param: string }
        Returns: Json
      }
      generate_short_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_random_advertisement: {
        Args: Record<PropertyKey, never>
        Returns: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          advertiser_id: string
          click_url: string
          clicks_count: number | null
          created_at: string | null
          html_content: string | null
          id: string
          image_url: string | null
          status: Database["public"]["Enums"]["ad_status"]
          title: string
          updated_at: string | null
          views_count: number | null
        }
      }
      user_can_access_conversation: {
        Args: { conversation_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      ad_status: "active" | "inactive" | "pending"
      ad_type: "image" | "html"
      user_type: "content_provider" | "advertiser"
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
      ad_status: ["active", "inactive", "pending"],
      ad_type: ["image", "html"],
      user_type: ["content_provider", "advertiser"],
    },
  },
} as const
