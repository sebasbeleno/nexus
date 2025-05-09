'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Separator } from '@workspace/ui/components/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { createClient } from '@/utils/supabase/client';
import { getProjectById } from '@workspace/db/src/queries/projects';
import { Tables } from '@workspace/db/src/types';
import { toast } from 'sonner';
import { ProjectDetails } from './components/project-details';
import { ProjectSurveys } from './components/project-surveys';

type ProjectRow = Tables<'projects'>;

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        const { data, error } = await getProjectById(supabase, params.id);
        
        if (error) throw error;
        if (!data) throw new Error('Proyecto no encontrado');
        
        setProject(data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles del proyecto');
        toast.error('Error al cargar los detalles del proyecto');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id]);

  // Determine status label and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Activo', variant: 'default' as const };
      case 'completed':
        return { label: 'Completado', variant: 'secondary' as const };
      case 'archived':
        return { label: 'Archivado', variant: 'outline' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando detalles del proyecto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert className="my-4">
        <AlertTitle>Proyecto no encontrado</AlertTitle>
        <AlertDescription>No se pudo encontrar el proyecto solicitado.</AlertDescription>
      </Alert>
    );
  }

  const statusDisplay = getStatusDisplay(project.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="surveys">Encuestas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <ProjectDetails project={project} />
        </TabsContent>
        
        <TabsContent value="surveys">
          <ProjectSurveys projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
