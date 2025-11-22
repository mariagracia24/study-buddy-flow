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
      assignments: {
        Row: {
          class_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_minutes: number | null
          id: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          ai_parsed: boolean | null
          created_at: string | null
          difficulty: string | null
          estimated_remaining_minutes: number | null
          estimated_total_minutes: number | null
          id: string
          last_studied_date: string | null
          name: string
          progress_percentage: number | null
          streak: number | null
          syllabus_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_parsed?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          estimated_remaining_minutes?: number | null
          estimated_total_minutes?: number | null
          id?: string
          last_studied_date?: string | null
          name: string
          progress_percentage?: number | null
          streak?: number | null
          syllabus_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_parsed?: boolean | null
          created_at?: string | null
          difficulty?: string | null
          estimated_remaining_minutes?: number | null
          estimated_total_minutes?: number | null
          id?: string
          last_studied_date?: string | null
          name?: string
          progress_percentage?: number | null
          streak?: number | null
          syllabus_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_calendar: {
        Row: {
          blocks: Json | null
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blocks?: Json | null
          created_at?: string | null
          date: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blocks?: Json | null
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          back_photo_url: string | null
          caption: string | null
          class_id: string | null
          created_at: string | null
          front_photo_url: string | null
          id: string
          minutes_studied: number
          photo_url: string
          session_id: string
          timelapse_url: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          back_photo_url?: string | null
          caption?: string | null
          class_id?: string | null
          created_at?: string | null
          front_photo_url?: string | null
          id?: string
          minutes_studied: number
          photo_url: string
          session_id: string
          timelapse_url?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          back_photo_url?: string | null
          caption?: string | null
          class_id?: string | null
          created_at?: string | null
          front_photo_url?: string | null
          id?: string
          minutes_studied?: number
          photo_url?: string
          session_id?: string
          timelapse_url?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      pinky_promises: {
        Row: {
          block_id: string
          created_at: string | null
          date: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          block_id: string
          created_at?: string | null
          date: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          block_id?: string
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          calendar_connected: boolean | null
          created_at: string | null
          display_name: string
          earliest_study_time: string | null
          google_calendar_id: string | null
          id: string
          joined_at: string | null
          last_study_date: string | null
          latest_study_time: string | null
          longest_streak: number | null
          photo_url: string | null
          streak: number | null
          total_minutes: number | null
          updated_at: string | null
          user_id: string
          username: string
          weekday_study_range: string | null
          weekend_study_range: string | null
        }
        Insert: {
          bio?: string | null
          calendar_connected?: boolean | null
          created_at?: string | null
          display_name: string
          earliest_study_time?: string | null
          google_calendar_id?: string | null
          id?: string
          joined_at?: string | null
          last_study_date?: string | null
          latest_study_time?: string | null
          longest_streak?: number | null
          photo_url?: string | null
          streak?: number | null
          total_minutes?: number | null
          updated_at?: string | null
          user_id: string
          username: string
          weekday_study_range?: string | null
          weekend_study_range?: string | null
        }
        Update: {
          bio?: string | null
          calendar_connected?: boolean | null
          created_at?: string | null
          display_name?: string
          earliest_study_time?: string | null
          google_calendar_id?: string | null
          id?: string
          joined_at?: string | null
          last_study_date?: string | null
          latest_study_time?: string | null
          longest_streak?: number | null
          photo_url?: string | null
          streak?: number | null
          total_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
          weekday_study_range?: string | null
          weekend_study_range?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      study_blocks: {
        Row: {
          assignment_id: string | null
          block_date: string
          class_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          start_time: string | null
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          block_date: string
          class_id: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          start_time?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          block_date?: string
          class_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          start_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_blocks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_blocks_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          assignment_id: string | null
          back_photo_url: string | null
          block_id: string | null
          class_id: string | null
          completed_at: string
          created_at: string | null
          front_photo_url: string | null
          id: string
          minutes_studied: number
          photo_url: string | null
          started_at: string
          status: string | null
          target_minutes: number | null
          timelapse_url: string | null
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          back_photo_url?: string | null
          block_id?: string | null
          class_id?: string | null
          completed_at: string
          created_at?: string | null
          front_photo_url?: string | null
          id?: string
          minutes_studied: number
          photo_url?: string | null
          started_at: string
          status?: string | null
          target_minutes?: number | null
          timelapse_url?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          back_photo_url?: string | null
          block_id?: string | null
          class_id?: string | null
          completed_at?: string
          created_at?: string | null
          front_photo_url?: string | null
          id?: string
          minutes_studied?: number
          photo_url?: string | null
          started_at?: string
          status?: string | null
          target_minutes?: number | null
          timelapse_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_assignments: {
        Row: {
          class_id: string
          created_at: string | null
          due_date: string | null
          estimated_minutes: number
          id: string
          title: string
          type: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          title: string
          type?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_topics: {
        Row: {
          class_id: string
          created_at: string | null
          description: string | null
          estimated_minutes: number
          id: string
          order_index: number
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_topics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_class_streak: {
        Args: { p_class_id: string; p_minutes: number; p_user_id: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_minutes: number; p_user_id: string }
        Returns: undefined
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
