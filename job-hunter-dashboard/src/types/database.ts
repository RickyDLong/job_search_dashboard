export type PipelineStage =
  | "discovered"
  | "saved"
  | "applied"
  | "phone_screen"
  | "technical"
  | "final_round"
  | "offer"
  | "accepted"
  | "rejected";

export type RemotePolicy = "fully_remote" | "hybrid" | "onsite";
export type ContactTag = "warm" | "cold" | "referral" | "internal";
export type ResumeType = "master" | "tailored";
export type ActivityType = "applied" | "response" | "interview" | "offer" | "rejected" | "follow_up" | "note";

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          company: string;
          role: string;
          salary: string;
          stage: PipelineStage;
          source: string;
          url: string | null;
          match_score: number;
          days_in_stage: number;
          dual_contract_compatible: boolean;
          tags: string[];
          red_flags: string[];
          notes: string | null;
          applied_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["jobs"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
      };
      resumes: {
        Row: {
          id: string;
          name: string;
          type: ResumeType;
          version: string;
          ats_score: number;
          keywords: string[];
          last_modified: string;
          linked_job_id: string | null;
          linked_job_title: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resumes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["resumes"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          role: string;
          company: string;
          email: string;
          phone: string;
          linkedin_url: string | null;
          tag: ContactTag;
          last_contact: string | null;
          next_follow_up: string | null;
          notes: string | null;
          job_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contacts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          glassdoor_rating: number;
          funding: string;
          headcount: string;
          remote_policy: RemotePolicy;
          open_positions: number;
          red_flags: string[];
          notes: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      activity_log: {
        Row: {
          id: string;
          type: ActivityType;
          title: string;
          description: string | null;
          job_id: string | null;
          contact_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activity_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
      };
    };
  };
}

// Convenience types
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Resume = Database["public"]["Tables"]["resumes"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
