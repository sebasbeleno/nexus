'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { createClient } from '@/utils/supabase/client';
import { getSurveysByProject } from '@workspace/db/src/queries/surveys';
import { Tables } from '@workspace/db/src/types';
import { toast } from 'sonner';

type SurveyRow = Tables<'surveys'>;

interface ProjectSurveysProps {
  projectId: string;
}

export function ProjectSurveys({ projectId }: ProjectSurveysProps) {
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        const { data, error } = await getSurveysByProject(supabase, projectId);
        
        if (error) throw error;
        
        setSurveys(data || []);
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las encuestas');
        toast.error('Error al cargar las encuestas', {
          description: 'No se pudieron cargar las encuestas asociadas al proyecto.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSurveys();
  }, [projectId]);

  // Helper function to format dates
  function formatDate(dateString: string | null) {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper function for deadline status and badge
  function getDeadlineStatus(deadline: string | null) {
    if (!deadline) return { label: 'Sin fecha', variant: 'secondary' as const };
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const differenceInDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (differenceInDays < 0) return { label: 'Vencido', variant: 'destructive' as const };
    if (differenceInDays <= 7) return { label: `${differenceInDays} días`, variant: 'warning' as const };
    return { label: `${differenceInDays} días`, variant: 'default' as const };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Cargando encuestas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Encuestas</CardTitle>
          <CardDescription>Encuestas asociadas a este proyecto</CardDescription>
        </div>
        <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Nueva encuesta</span>
        </Button>
      </CardHeader>
      <CardContent>
        {surveys.length === 0 ? (
          <Alert>
            <AlertTitle>No hay encuestas</AlertTitle>
            <AlertDescription>Este proyecto aún no tiene encuestas asociadas.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <Link 
                href={`/admin/projects/${projectId}/survey/${survey.id}`}
                key={survey.id}
                className="block"
              >
                <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{survey.name}</h3>
                      {survey.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={getDeadlineStatus(survey.deadline).variant}>
                      {getDeadlineStatus(survey.deadline).label}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>Creada: {formatDate(survey.created_at)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>Fecha límite: {formatDate(survey.deadline)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
