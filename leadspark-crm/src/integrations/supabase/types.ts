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
      CallLog: {
        Row: {
          createdAt: string | null
          description: string
          duration_minutes: number | null
          email: string | null
          id: number
          leadId: number
          name: string
          phone: string | null
        }
        Insert: {
          createdAt?: string | null
          description: string
          duration_minutes?: number | null
          email?: string | null
          id?: number
          leadId: number
          name: string
          phone?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string
          duration_minutes?: number | null
          email?: string | null
          id?: number
          leadId?: number
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CallLog_leadId_fkey"
            columns: ["leadId"]
            isOneToOne: false
            referencedRelation: "Lead"
            referencedColumns: ["id"]
          },
        ]
      }
      FollowUpHistory: {
        Row: {
          createdAt: string | null
          description: string
          id: number
          leadId: number
          notes: string | null
          priority: string | null
          status: string | null
        }
        Insert: {
          createdAt?: string | null
          description: string
          id?: number
          leadId: number
          notes?: string | null
          priority?: string | null
          status?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string
          id?: number
          leadId?: number
          notes?: string | null
          priority?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FollowUpHistory_leadId_fkey"
            columns: ["leadId"]
            isOneToOne: false
            referencedRelation: "Lead"
            referencedColumns: ["id"]
          },
        ]
      }
      Lead: {
        Row: {
          assignee: string | null
          companyName: string
          contactPerson: string | null
          createdAt: string | null
          email: string | null
          followUpTime: string | null
          id: number
          leadName: string
          leadSource: string | null
          location: string | null
          nextFollowUpDate: string | null
          notes: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          service: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updatedAt: string | null
        }
        Insert: {
          assignee?: string | null
          companyName: string
          contactPerson?: string | null
          createdAt?: string | null
          email?: string | null
          followUpTime?: string | null
          id?: number
          leadName: string
          leadSource?: string | null
          location?: string | null
          nextFollowUpDate?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          service?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updatedAt?: string | null
        }
        Update: {
          assignee?: string | null
          companyName?: string
          contactPerson?: string | null
          createdAt?: string | null
          email?: string | null
          followUpTime?: string | null
          id?: number
          leadName?: string
          leadSource?: string | null
          location?: string | null
          nextFollowUpDate?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          service?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updatedAt?: string | null
        }
        Relationships: []
      }
      LeadNoteHistory: {
        Row: {
          createdAt: string | null
          createdBy: string
          id: number
          leadId: number
          note: string
        }
        Insert: {
          createdAt?: string | null
          createdBy: string
          id?: number
          leadId: number
          note: string
        }
        Update: {
          createdAt?: string | null
          createdBy?: string
          id?: number
          leadId?: number
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "LeadNoteHistory_leadId_fkey"
            columns: ["leadId"]
            isOneToOne: false
            referencedRelation: "Lead"
            referencedColumns: ["id"]
          },
        ]
      }
      Role: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          auth_user_id: string | null
          createdAt: string | null
          department: string | null
          email: string
          id: number
          joinDate: string | null
          leadsAssigned: number | null
          leadsConverted: number | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updatedAt: string | null
        }
        Insert: {
          auth_user_id?: string | null
          createdAt?: string | null
          department?: string | null
          email: string
          id?: number
          joinDate?: string | null
          leadsAssigned?: number | null
          leadsConverted?: number | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updatedAt?: string | null
        }
        Update: {
          auth_user_id?: string | null
          createdAt?: string | null
          department?: string | null
          email?: string
          id?: number
          joinDate?: string | null
          leadsAssigned?: number | null
          leadsConverted?: number | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updatedAt?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      lead_priority: "Low" | "Medium" | "High" | "Urgent"
      lead_status:
        | "New"
        | "Contacted"
        | "Qualified"
        | "Proposal"
        | "Negotiation"
        | "Won"
        | "Lost"
      user_role: "Admin" | "Employee"
      user_status: "active" | "inactive"
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
      lead_priority: ["Low", "Medium", "High", "Urgent"],
      lead_status: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ],
      user_role: ["Admin", "Employee"],
      user_status: ["active", "inactive"],
    },
  },
} as const
