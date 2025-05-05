import { useState, useEffect } from "react";
import { Project } from "@workspace/types";
import { createClient } from "@/utils/supabase/client";

interface UseFetchOrganizationProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetchOrganizationProjects(organizationId: string): UseFetchOrganizationProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  async function fetchProjects() {
    if (!organizationId) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId);

      if (fetchError) {
        throw fetchError;
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching organization projects:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [organizationId]);

  return { projects, isLoading, error, refetch: fetchProjects };
}
