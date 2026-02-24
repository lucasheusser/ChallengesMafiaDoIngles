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
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'student' | 'teacher' | 'admin'
          full_name: string | null
          coins_total: number
          points_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'student' | 'teacher' | 'admin'
          full_name?: string | null
          coins_total?: number
          points_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'student' | 'teacher' | 'admin'
          full_name?: string | null
          coins_total?: number
          points_total?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          content_json: Json
          points_reward: number
          coin_reward: number
          publish_date: string
          status: 'draft' | 'published' | 'archived'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          content_json: Json
          points_reward?: number
          coin_reward?: number
          publish_date: string
          status?: 'draft' | 'published' | 'archived'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          content_json?: Json
          points_reward?: number
          coin_reward?: number
          publish_date?: string
          status?: 'draft' | 'published' | 'archived'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          answers_json: Json
          status: 'pending' | 'approved' | 'rejected'
          feedback_text: string | null
          reviewed_by: string | null
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          answers_json: Json
          status?: 'pending' | 'approved' | 'rejected'
          feedback_text?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          answers_json?: Json
          status?: 'pending' | 'approved' | 'rejected'
          feedback_text?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount_coins: number
          amount_points: number
          ref_submission_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount_coins?: number
          amount_points?: number
          ref_submission_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount_coins?: number
          amount_points?: number
          ref_submission_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_ref_submission_id_fkey"
            columns: ["ref_submission_id"]
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          }
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
