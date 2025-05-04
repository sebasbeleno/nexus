import { useState, useEffect } from "react";
import { Project } from "@workspace/types";
import { createClient } from "@/utils/supabase/client";

interface UseFetchProjectsResult {
  projects: (Project & { organization?: { name: string } })[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetchProjects(): UseFetchProjectsResult {
  const [projects, setProjects] = useState<(Project & { organization?: { name: string } })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  async function fetchProjects() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select(`
          *,
          organization:organization_id (
            name
          )
        `);

      if (fetchError) {
        throw fetchError;
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, isLoading, error, refetch: fetchProjects };
}
