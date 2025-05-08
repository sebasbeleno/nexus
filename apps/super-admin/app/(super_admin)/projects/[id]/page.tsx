"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import type { Project } from "@workspace/types";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createClient } from "@/utils/supabase/client";

// Import the tab components
import { ProjectDetailsTab } from "./components/project-details-tab";
import { ProjectSettingsTab } from "./components/project-settings-tab";
import { SurveysTab } from "./components/project-surveys-tab";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id: ProjectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProjectData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', ProjectId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Project not found')

      setProject(data)
    

    } catch (err: any) {
      console.error("Failed to fetch project:", err);
      setError(err.message || "No se pudieron cargar los detalles del proyecto."); // Translate error message
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [ProjectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // No longer need save and delete handlers as they're moved to settings tab

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Encontrado</AlertTitle> {/* Translate title */}
          <AlertDescription>No se pudo encontrar el proyecto.</AlertDescription> {/* Translate description */}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || "Sin descripción proporcionada."}</p> {/* Translate placeholder */}
        </div>
      </div>

      <Separator />

      {/* Tabs for Details, Settings, Surveys */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger> {/* Translate tab trigger */}
          <TabsTrigger value="surveys">Encuestas</TabsTrigger> {/* Translate tab trigger */}
          <TabsTrigger value="settings">Configuración</TabsTrigger> {/* Translate tab trigger */}
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {project && <ProjectDetailsTab project={project} />}
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <SurveysTab projectId={ProjectId} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          {project && (
            <ProjectSettingsTab
              project={project}
              onProjectUpdate={(updatedProject) => {
                setProject(updatedProject);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Project Dialog removed - now in ProjectSettingsTab */}

      {/* No CreateSurveyDialog here - moved to SurveysTab */}
    </div>
  );
}
