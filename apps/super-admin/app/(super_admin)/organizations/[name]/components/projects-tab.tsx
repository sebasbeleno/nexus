"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useFetchOrganizationProjects } from "@/hooks/use-fetch-organization-projects";
import { ProjectCard } from "@/components/project-card";

interface ProjectsTabProps {
  organization: {
    id: string;
    name: string;
  };
}

export function ProjectsTab({ organization }: ProjectsTabProps) {
  const { projects, isLoading, error, refetch } = useFetchOrganizationProjects(organization.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'Invalid Date' 
      : date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Proyectos de la Organización</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Crear Proyecto
        </Button>
      </div>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
        defaultOrganizationId={organization.id}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando proyectos...</span>
        </div>
      )}

      {error && !isLoading && (
         <Alert variant="destructive" className="mb-6">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error al cargar proyectos</AlertTitle>
           <AlertDescription>
             {error.message || "Ocurrió un error inesperado."}
             <Button variant="link" onClick={refetch} className="ml-2 p-0 h-auto">
               Intentar de nuevo
             </Button>
           </AlertDescription>
         </Alert>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>No hay proyectos</AlertTitle>
          <AlertDescription>
            Aún no se han creado proyectos para esta organización. ¡Crea el primero!
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={{
                ...project,
                organization: { name: organization.name }
              }}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
