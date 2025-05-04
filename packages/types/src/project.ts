export type ProjectStatus = "active" | "completed" | "archived";

    export interface Project {
      id: string; // UUID
      organization_id: string; // UUID
      name: string;
      description?: string | null;
      status: ProjectStatus;
      start_date?: string | null; // TIMESTAMPTZ
      end_date?: string | null; // TIMESTAMPTZ
      created_by: string; // UUID
      updated_by: string; // UUID
      created_at: string; // TIMESTAMPTZ
      updated_at: string; // TIMESTAMPTZ
    }
    