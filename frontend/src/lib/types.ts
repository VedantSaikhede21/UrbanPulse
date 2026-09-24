export interface Ticket {
  id: string;
  citizen_id?: string | null;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  description?: string | null;
  status: string;
  is_spam?: boolean;
  is_duplicate?: boolean;
  duplicate_of_id?: string | null;
  priority_score: number;
  priority_reason?: string | null;
  assigned_officer_id?: string | null;
  verification_status?: string | null;
  verification_reason?: string | null;
  original_media_url?: string | null;
  closure_media_url?: string | null;
  voice_note_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  assigned_officer?: string;
}

export interface Ward {
  id: string;
  name: string;
  uhs_score: number;
}

export interface CityPulse {
  wards: { name: string; uhs_score: number }[];
  critical_wards: number;
  trending_categories: { category: string; count: number }[];
  pulse_alerts: string[];
}

export interface Officer {
  id: string;
  name: string;
  department: string;
  is_active: boolean;
  created_at?: string | null;
}

export interface AuditEntry {
  id: number;
  user_id?: string | null;
  action: string;
  target_table: string;
  record_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string | null;
}