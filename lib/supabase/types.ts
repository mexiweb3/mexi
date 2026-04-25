/**
 * Hand-written Database type matching supabase/migrations/0001_init.sql.
 * Strict, no `any`. Keep in sync with the SQL.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ChildAvatar = "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
export type KeyboardBrand = "yamaha" | "casio" | "otro" | "ninguno";
export type ParentPlan = "free" | "premium";

export type ProfilesParentRow = {
  id: string;
  email: string;
  display_name: string | null;
  consent_signed_at: string | null;
  consent_ip: string | null;
  locale: string;
  plan: ParentPlan;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfilesParentInsert = {
  id: string;
  email: string;
  display_name?: string | null;
  consent_signed_at?: string | null;
  consent_ip?: string | null;
  locale?: string;
  plan?: ParentPlan;
  stripe_customer_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfilesParentUpdate = {
  id?: string;
  email?: string;
  display_name?: string | null;
  consent_signed_at?: string | null;
  consent_ip?: string | null;
  locale?: string;
  plan?: ParentPlan;
  stripe_customer_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfilesChildRow = {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  avatar: ChildAvatar;
  keyboard_brand: KeyboardBrand | null;
  created_at: string;
};

export type ProfilesChildInsert = {
  id?: string;
  parent_id: string;
  name: string;
  age: number;
  avatar: ChildAvatar;
  keyboard_brand?: KeyboardBrand | null;
  created_at?: string;
};

export type ProfilesChildUpdate = {
  id?: string;
  parent_id?: string;
  name?: string;
  age?: number;
  avatar?: ChildAvatar;
  keyboard_brand?: KeyboardBrand | null;
  created_at?: string;
};

export type LessonsRow = {
  id: string;
  module: number;
  order_in_module: number;
  title: string;
  is_premium: boolean;
  duration_min: number;
};

export type LessonsInsert = {
  id: string;
  module: number;
  order_in_module: number;
  title: string;
  is_premium?: boolean;
  duration_min?: number;
};

export type LessonsUpdate = {
  id?: string;
  module?: number;
  order_in_module?: number;
  title?: string;
  is_premium?: boolean;
  duration_min?: number;
};

export type ChildProgressRow = {
  child_id: string;
  lesson_id: string;
  stars: number | null;
  best_score: number | null;
  completed_at: string | null;
  total_time_sec: number;
  attempts: number;
};

export type ChildProgressInsert = {
  child_id: string;
  lesson_id: string;
  stars?: number | null;
  best_score?: number | null;
  completed_at?: string | null;
  total_time_sec?: number;
  attempts?: number;
};

export type ChildProgressUpdate = {
  child_id?: string;
  lesson_id?: string;
  stars?: number | null;
  best_score?: number | null;
  completed_at?: string | null;
  total_time_sec?: number;
  attempts?: number;
};

export type BadgesRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type BadgesInsert = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type BadgesUpdate = {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
};

export type ChildBadgesRow = {
  child_id: string;
  badge_id: string;
  awarded_at: string;
};

export type ChildBadgesInsert = {
  child_id: string;
  badge_id: string;
  awarded_at?: string;
};

export type ChildBadgesUpdate = {
  child_id?: string;
  badge_id?: string;
  awarded_at?: string;
};

export type SubscriptionsRow = {
  parent_id: string;
  stripe_sub_id: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
};

export type SubscriptionsInsert = {
  parent_id: string;
  stripe_sub_id?: string | null;
  status?: string | null;
  current_period_end?: string | null;
  cancel_at?: string | null;
};

export type SubscriptionsUpdate = {
  parent_id?: string;
  stripe_sub_id?: string | null;
  status?: string | null;
  current_period_end?: string | null;
  cancel_at?: string | null;
};

export type EventsRow = {
  id: number;
  parent_id: string | null;
  child_id: string | null;
  type: string;
  payload: Json;
  created_at: string;
};

export type EventsInsert = {
  id?: number;
  parent_id?: string | null;
  child_id?: string | null;
  type: string;
  payload?: Json;
  created_at?: string;
};

export type EventsUpdate = {
  id?: number;
  parent_id?: string | null;
  child_id?: string | null;
  type?: string;
  payload?: Json;
  created_at?: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles_parent: {
        Row: ProfilesParentRow;
        Insert: ProfilesParentInsert;
        Update: ProfilesParentUpdate;
        Relationships: [];
      };
      profiles_child: {
        Row: ProfilesChildRow;
        Insert: ProfilesChildInsert;
        Update: ProfilesChildUpdate;
        Relationships: [];
      };
      lessons: {
        Row: LessonsRow;
        Insert: LessonsInsert;
        Update: LessonsUpdate;
        Relationships: [];
      };
      child_progress: {
        Row: ChildProgressRow;
        Insert: ChildProgressInsert;
        Update: ChildProgressUpdate;
        Relationships: [];
      };
      badges: {
        Row: BadgesRow;
        Insert: BadgesInsert;
        Update: BadgesUpdate;
        Relationships: [];
      };
      child_badges: {
        Row: ChildBadgesRow;
        Insert: ChildBadgesInsert;
        Update: ChildBadgesUpdate;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionsRow;
        Insert: SubscriptionsInsert;
        Update: SubscriptionsUpdate;
        Relationships: [];
      };
      events: {
        Row: EventsRow;
        Insert: EventsInsert;
        Update: EventsUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, { Row: Record<string, unknown>; Relationships: [] }>;
    Functions: Record<
      string,
      { Args: Record<string, unknown>; Returns: unknown }
    >;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
};
