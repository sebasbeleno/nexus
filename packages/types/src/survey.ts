// Defines the structure for the Survey object based on the database schema.
export interface Survey {
  id: string; // UUID
  project_id: string; // UUID
  name: string;
  description?: string | null;
  structure: Record<string, any>; // JSONB - Represented as a generic object type
  version: number;
  deadline?: string | null; // TIMESTAMPTZ - ISO 8601 string
  metadata?: Record<string, any> | null; // JSONB
  created_at: string; // TIMESTAMPTZ - ISO 8601 string
  updated_at: string; // TIMESTAMPTZ - ISO 8601 string
}

export interface SurveyResponse {
  id: string;
  assignment_id: string;
  responses: Record<string, any>;
  submitted_at: string;
  location_submitted: any; // GeoJSON object
  metadata: Record<string, any> | null;
  surveyor_notes: string | null;
}