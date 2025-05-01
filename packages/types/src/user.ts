export type UserRole = "super_admin" | "admin" | "analyst" | "surveyor";

export interface User {
  id: string; // UUID maps to string in TS
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization_id?: string | null; // UUID, optional
  is_active?: boolean;
  last_login?: string | null; // Timestamp maps to string or Date
  created_at?: string; // Timestamp
  updated_at?: string; // Timestamp
  phone_number?: string | null;
  profile_image_url?: string | null;
  consent_to_data_processing?: boolean;
  password_last_changed?: string | null; // Timestamp
  failed_login_attempts?: number;
  account_locked?: boolean;
}
