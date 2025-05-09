'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tables } from '@workspace/db/src/types';

type ProjectRow = Tables<'projects'>;

interface ProjectDetailsProps {
  project: ProjectRow;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del proyecto</CardTitle>
        <CardDescription>Detalles básicos sobre este proyecto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
          <p>{project.description || "Sin descripción"}</p>
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
        
        {/* Additional metadata could be displayed here */}
      </CardContent>
    </Card>
  );
}
