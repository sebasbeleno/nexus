import { useState, useEffect } from "react";
import { Project } from "@workspace/types";
import { createClient } from "@/utils/supabase/client"; // Adjust path if necessary

interface UseFetchProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetchProjects(): UseFetchProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  async function fetchProjects() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*"); // Select all columns for now

      if (fetchError) {
        throw fetchError;
      }

      // TODO: Add Zod validation here if needed
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on initial mount

  return { projects, isLoading, error, refetch: fetchProjects };
}
