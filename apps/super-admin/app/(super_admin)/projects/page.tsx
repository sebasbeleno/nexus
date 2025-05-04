"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Project } from "@workspace/types";
import { Loader2, AlertCircle, Info, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useFetchProjects } from "@/hooks/use-fetch-projects";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

const statusVariantMap: Record<string, string> = {
  active: "border-green-500/50 bg-green-50/50 dark:bg-green-950/50",
  completed: "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/50",
  archived: "border-gray-200 bg-gray-50/50 dark:bg-gray-800/50",
} as const;

export default function ProjectsPage() {
  const router = useRouter();
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
            <Card 
              key={project.id} 
              className={cn(
                "relative",
                statusVariantMap[project.status.toLowerCase()] || statusVariantMap.archived
              )}
            >
              <CardHeader className="grid gap-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.organization?.name ?? `ID: ${project.organization_id}`}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(project.id)}
                      >
                        Copiar ID del Proyecto
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Archivar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-medium">{project.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Creado:</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
