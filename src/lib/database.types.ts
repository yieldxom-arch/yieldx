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
          id: string
          email: string
          full_name: string
          role: 'student' | 'lecturer' | 'admin'
          display_name: string | null
          phone_number: string | null
          student_id: string | null
          organization: string | null
          major: string | null
          bio: string | null
          profile_visibility: 'public' | 'private'
          subscription_tier: 'free' | 'premium' | 'enterprise'
          subscription_start_date: string | null
          subscription_end_date: string | null
          total_xp: number
          current_streak: number
          last_login_date: string | null
          total_login_days: number
          university_id: string | null
          class_id: string | null
          language: 'ar' | 'en'
          theme: 'light' | 'dark'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'lecturer' | 'admin'
          display_name?: string | null
          phone_number?: string | null
          student_id?: string | null
          organization?: string | null
          major?: string | null
          bio?: string | null
          profile_visibility?: 'public' | 'private'
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          total_xp?: number
          current_streak?: number
          last_login_date?: string | null
          total_login_days?: number
          university_id?: string | null
          class_id?: string | null
          language?: 'ar' | 'en'
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'lecturer' | 'admin'
          display_name?: string | null
          phone_number?: string | null
          student_id?: string | null
          organization?: string | null
          major?: string | null
          bio?: string | null
          profile_visibility?: 'public' | 'private'
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          total_xp?: number
          current_streak?: number
          last_login_date?: string | null
          total_login_days?: number
          university_id?: string | null
          class_id?: string | null
          language?: 'ar' | 'en'
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
      }
      levels: {
        Row: {
          id: number
          level_number: number
          title_en: string
          title_ar: string
          subtitle_en: string | null
          subtitle_ar: string | null
          description_en: string | null
          description_ar: string | null
          objective_en: string | null
          objective_ar: string | null
          deliverable_en: string | null
          deliverable_ar: string | null
          max_xp: number
          is_active: boolean
          order_index: number
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          level_number: number
          title_en: string
          title_ar: string
          subtitle_en?: string | null
          subtitle_ar?: string | null
          description_en?: string | null
          description_ar?: string | null
          objective_en?: string | null
          objective_ar?: string | null
          deliverable_en?: string | null
          deliverable_ar?: string | null
          max_xp?: number
          is_active?: boolean
          order_index: number
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          level_number?: number
          title_en?: string
          title_ar?: string
          subtitle_en?: string | null
          subtitle_ar?: string | null
          description_en?: string | null
          description_ar?: string | null
          objective_en?: string | null
          objective_ar?: string | null
          deliverable_en?: string | null
          deliverable_ar?: string | null
          max_xp?: number
          is_active?: boolean
          order_index?: number
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          level_id: number
          status: 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'late'
          xp_earned: number
          completed: boolean
          unlocked: boolean
          submission_data: Json | null
          submitted_at: string | null
          graded_at: string | null
          grade: number | null
          teacher_feedback: string | null
          current_attempts: number
          max_attempts: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level_id: number
          status?: 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'late'
          xp_earned?: number
          completed?: boolean
          unlocked?: boolean
          submission_data?: Json | null
          submitted_at?: string | null
          graded_at?: string | null
          grade?: number | null
          teacher_feedback?: string | null
          current_attempts?: number
          max_attempts?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level_id?: number
          status?: 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'late'
          xp_earned?: number
          completed?: boolean
          unlocked?: boolean
          submission_data?: Json | null
          submitted_at?: string | null
          graded_at?: string | null
          grade?: number | null
          teacher_feedback?: string | null
          current_attempts?: number
          max_attempts?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title_en: string
          title_ar: string
          description_en: string | null
          description_ar: string | null
          category_id: string | null
          level_id: number | null
          duration_minutes: number | null
          thumbnail_url: string | null
          video_url: string
          instructor_name_en: string | null
          instructor_name_ar: string | null
          required_tier: 'free' | 'premium' | 'enterprise'
          views: number
          rating: number
          is_new: boolean
          is_active: boolean
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_en: string
          title_ar: string
          description_en?: string | null
          description_ar?: string | null
          category_id?: string | null
          level_id?: number | null
          duration_minutes?: number | null
          thumbnail_url?: string | null
          video_url: string
          instructor_name_en?: string | null
          instructor_name_ar?: string | null
          required_tier?: 'free' | 'premium' | 'enterprise'
          views?: number
          rating?: number
          is_new?: boolean
          is_active?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_en?: string
          title_ar?: string
          description_en?: string | null
          description_ar?: string | null
          category_id?: string | null
          level_id?: number | null
          duration_minutes?: number | null
          thumbnail_url?: string | null
          video_url?: string
          instructor_name_en?: string | null
          instructor_name_ar?: string | null
          required_tier?: 'free' | 'premium' | 'enterprise'
          views?: number
          rating?: number
          is_new?: boolean
          is_active?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      video_categories: {
        Row: {
          id: string
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          icon: string | null
          color: string | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number | null
          created_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          scope: 'global' | 'country' | 'university' | 'class'
          scope_id: string | null
          total_xp: number
          levels_completed: number
          badges_count: number
          rank: number | null
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          scope: 'global' | 'country' | 'university' | 'class'
          scope_id?: string | null
          total_xp?: number
          levels_completed?: number
          badges_count?: number
          rank?: number | null
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          scope?: 'global' | 'country' | 'university' | 'class'
          scope_id?: string | null
          total_xp?: number
          levels_completed?: number
          badges_count?: number
          rank?: number | null
          last_updated?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name_en: string
          name_ar: string
          description_en: string | null
          description_ar: string | null
          icon: string | null
          category: string | null
          xp_reward: number
          unlock_criteria: Json | null
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_ar: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          category?: string | null
          xp_reward?: number
          unlock_criteria?: Json | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_ar?: string
          description_en?: string | null
          description_ar?: string | null
          icon?: string | null
          category?: string | null
          xp_reward?: number
          unlock_criteria?: Json | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'achievement' | 'badge' | 'deadline' | 'feedback' | 'system'
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'achievement' | 'badge' | 'deadline' | 'feedback' | 'system'
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'achievement' | 'badge' | 'deadline' | 'feedback' | 'system'
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          mode: 'individual' | 'team'
          created_by: string
          cohort_id: string | null
          class_code: string | null
          qr_code: string | null
          is_template: boolean
          forked_from: string | null
          status: 'draft' | 'in-progress' | 'submitted' | 'graded' | 'completed'
          template_data: Json | null
          project_type: 'agricultural' | 'industrial' | 'commercial' | 'service' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          mode?: 'individual' | 'team'
          created_by: string
          cohort_id?: string | null
          class_code?: string | null
          qr_code?: string | null
          is_template?: boolean
          forked_from?: string | null
          status?: 'draft' | 'in-progress' | 'submitted' | 'graded' | 'completed'
          template_data?: Json | null
          project_type?: 'agricultural' | 'industrial' | 'commercial' | 'service' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          mode?: 'individual' | 'team'
          created_by?: string
          cohort_id?: string | null
          class_code?: string | null
          qr_code?: string | null
          is_template?: boolean
          forked_from?: string | null
          status?: 'draft' | 'in-progress' | 'submitted' | 'graded' | 'completed'
          template_data?: Json | null
          project_type?: 'agricultural' | 'industrial' | 'commercial' | 'service' | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
