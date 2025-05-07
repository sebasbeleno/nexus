"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import type { Project } from "@workspace/types";

interface ProjectDetailsTabProps {
  project: Project;
}

export function ProjectDetailsTab({ project }: ProjectDetailsTabProps) {
  // Format dates for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
          <CardDescription>Resumen de la información del proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
              <Badge
                variant={
                  project.status === "active"
                    ? "default"
                    : project.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {project.status === "active"
                  ? "Activo"
                  : project.status === "completed"
                  ? "Completado"
                  : "Archivado"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">ID del Proyecto</h3>
              <p className="text-sm font-mono">{project.id}</p>
            </div>
          </div>

          {/* Project Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de Inicio</h3>
              <p>{formatDate(project.start_date)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de Finalización</h3>
              <p>{formatDate(project.end_date)}</p>
            </div>
          </div>

          {/* Creation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Creado el</h3>
              <p>{formatDate(project.created_at)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Última Actualización</h3>
              <p>{formatDate(project.updated_at)}</p>
            </div>
          </div>

          {/* Project Analytics/Insights Card (Placeholder) */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Estadísticas del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs text-muted-foreground">Encuestas Totales</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs text-muted-foreground">Respuestas Recolectadas</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs text-muted-foreground">Asignaciones Activas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
