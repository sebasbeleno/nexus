'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarIcon, BarChart, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { createClient } from '@/utils/supabase/client';
import { getSurveyById, getSurveyStatistics } from '@workspace/db/src/queries/surveys';
import { getProjectById } from '@workspace/db/src/queries/projects';
import { Tables } from '@workspace/db/src/types';
import { toast } from 'sonner';

type SurveyRow = Tables<'surveys'>;
type ProjectRow = Tables<'projects'>;

interface SurveyStatistics {
  totalAssignments: number;
  assignmentsByStatus: Record<string, number>;
  totalResponses: number;
  completionRate: number;
}

export default function SurveyDetailsPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id: surveyId } = use(params);
  const router = useRouter();

  const [survey, setSurvey] = useState<SurveyRow | null>(null);
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [stats, setStats] = useState<SurveyStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        
        // Fetch survey details
        const { data: surveyData, error: surveyError } = await getSurveyById(
          supabase, 
          surveyId
        );
        
        if (surveyError) throw surveyError;
        if (!surveyData) throw new Error('Encuesta no encontrada');
        
        setSurvey(surveyData);
        
        // Fetch parent project details
        const { data: projectData, error: projectError } = await getProjectById(
          supabase,
          projectId
        );
        
        if (projectError) throw projectError;
        setProject(projectData);
        
        // Fetch survey statistics
        const { data: statsData, error: statsError } = await getSurveyStatistics(
          supabase,
          surveyId
        );
        
        if (statsError) throw statsError;
        setStats(statsData);
        
      } catch (err) {
        console.error('Error fetching survey details:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles de la encuesta');
        toast.error('Error al cargar los detalles de la encuesta');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, surveyId]);

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper function to format percentages
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Helper function for deadline status and badge
  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return { label: 'Sin fecha', variant: 'secondary' as const };
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const differenceInDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (differenceInDays < 0) return { label: 'Vencido', variant: 'destructive' as const };
    if (differenceInDays <= 7) return { label: `${differenceInDays} días`, variant: 'warning' as const };
    return { label: `${differenceInDays} días`, variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando detalles de la encuesta...</span>
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

  if (!survey) {
    return (
      <Alert className="my-4">
        <AlertTitle>Encuesta no encontrada</AlertTitle>
        <AlertDescription>No se pudo encontrar la encuesta solicitada.</AlertDescription>
      </Alert>
    );
  }

  const deadlineStatus = getDeadlineStatus(survey.deadline);

  return (
    <div className="space-y-6">
      {/* Header with navigation and title */}
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
          <div>
            <h1 className="text-2xl font-bold">{survey.name}</h1>
            {project && (
              <p className="text-sm text-muted-foreground">
                Proyecto: {project.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={deadlineStatus.variant}>
            Fecha límite: {deadlineStatus.label}
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="responses">Respuestas</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Survey Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la encuesta</CardTitle>
              <CardDescription>Detalles básicos sobre esta encuesta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                <p>{survey.description || "Sin descripción"}</p>
              </div>
              
              {/* Survey Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Creada el</h3>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(survey.created_at)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha límite</h3>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(survey.deadline)}</p>
                  </div>
                </div>
              </div>
              
              {/* Version Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Versión</h3>
                <p>{survey.version || "1.0"}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Assignments */}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total asignaciones</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.totalAssignments}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {stats.assignmentsByStatus?.pending || 0} pendientes
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Completed Responses */}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Respuestas completadas</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats.totalResponses}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-muted-foreground">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {stats.assignmentsByStatus?.in_progress || 0} en progreso
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Completion Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tasa de finalización</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatPercentage(stats.completionRate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Respuestas de la encuesta</CardTitle>
              <CardDescription>Respuestas recopiladas para esta encuesta</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Próximamente</AlertTitle>
                <AlertDescription>
                  La visualización detallada de respuestas estará disponible próximamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones de la encuesta</CardTitle>
              <CardDescription>Usuarios asignados a completar esta encuesta</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Próximamente</AlertTitle>
                <AlertDescription>
                  La administración de asignaciones estará disponible próximamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
