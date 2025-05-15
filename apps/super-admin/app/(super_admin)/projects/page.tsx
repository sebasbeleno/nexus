"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { useFetchProjects } from "@/hooks/use-fetch-projects";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ProjectCard } from "@/components/project-card";


export default function ProjectsPage() {
  const { projects, isLoading, error, refetch } = useFetchProjects();
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Crear Proyecto
        </Button>
      </div>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
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
            Aún no se han creado proyectos. ¡Crea el primero!
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}
