'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@workspace/ui/components/card';
import { BarChart, Users, Activity, ClipboardList } from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { getProjectStatsByOrganization } from '@workspace/db/src/queries/projects';
import { getUserOrganization, countOrganizationUsers } from '@workspace/db/src/queries/organizations';
import { getSurveysWithApproachingDeadlines, getRecentSurveysWithStats } from '@workspace/db/src/queries/surveys';

interface DashboardData {
  activeProjects: number;
  totalProjects: number;
  completedProjects: number;
  totalUsers: number;
  activeSurveys: number;
  responseRate: string;
  upcomingSurveys: Array<{
    id: string;
    title: string;
    deadline: Date;
  }>;
  recentSurveys: Array<{
    id: string;
    title: string;
    completionRate: number;
  }>;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('No se pudo obtener información del usuario.');
          return;
        }
        
        // Get user's organization
        const { data: orgData, error: orgError } = await getUserOrganization(supabase, user.id);
        
        if (orgError || !orgData) {
          setError('No se pudo obtener información de la organización.');
          return;
        }
        
        setOrganizationId(orgData.id);
        
        // Get project stats
        const { data: projectStats, error: projectStatsError } = await getProjectStatsByOrganization(supabase, orgData.id);
        
        if (projectStatsError) {
          toast.error('Error al obtener estadísticas de proyectos', {
            description: projectStatsError.message
          });
        }
        
        // Get organization user count
        const { count: userCount, error: userCountError } = await countOrganizationUsers(supabase, orgData.id);
        
        if (userCountError) {
          toast.error('Error al obtener conteo de usuarios', {
            description: userCountError.message
          });
        }
        
        // Get surveys with approaching deadlines
        const { data: upcomingSurveysData, error: upcomingSurveysError } = await getSurveysWithApproachingDeadlines(supabase);
        
        if (upcomingSurveysError) {
          toast.error('Error al obtener encuestas próximas', {
            description: upcomingSurveysError.message
          });
        }
        
        // Get recent surveys with stats
        const { data: recentSurveysData, error: recentSurveysError } = await getRecentSurveysWithStats(supabase);
        
        if (recentSurveysError) {
          toast.error('Error al obtener encuestas recientes', {
            description: recentSurveysError.message
          });
        }
        
        // Calculate average completion rate
        let avgCompletionRate = 0;
        if (recentSurveysData && recentSurveysData.length > 0) {
          avgCompletionRate = recentSurveysData.reduce((acc, survey) => acc + survey.completionRate, 0) / recentSurveysData.length;
        }
        
        // Format the data
        setDashboardData({
          activeProjects: projectStats?.activeProjects || 0,
          totalProjects: projectStats?.totalProjects || 0,
          completedProjects: projectStats?.completedProjects || 0,
          totalUsers: userCount || 0,
          activeSurveys: recentSurveysData?.length || 0,
          responseRate: `${Math.round(avgCompletionRate * 100)}%`,
          upcomingSurveys: upcomingSurveysData?.map(survey => ({
            id: survey.id,
            title: survey.name,
            deadline: new Date(survey.deadline || new Date())
          })) || [],
          recentSurveys: recentSurveysData?.map(survey => ({
            id: survey.id,
            title: survey.name,
            completionRate: survey.completionRate
          })) || []
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard.');
        toast.error('Error al cargar datos', {
          description: 'Ocurrió un error al cargar los datos del dashboard.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold text-red-500 mb-2">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Panel de Administración</h1>
        <p className="text-muted-foreground">Bienvenido! Aquí hay una visión general de tu organización.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.activeProjects}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `De ${dashboardData?.totalProjects} proyectos`}
            </p>
          </CardContent>
        </Card>
        
        {/* Response Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.responseRate}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-36" /> : 'Promedio de todas las encuestas'}
            </p>
          </CardContent>
        </Card>
        
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.totalUsers}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-24" /> : 'Usuarios registrados'}
            </p>
          </CardContent>
        </Card>
        
        {/* Completed Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Completados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.completedProjects}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-36" /> : 'Finalizados exitosamente'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Upcoming Surveys Card */}
        <Card>
          <CardHeader>
            <CardTitle>Encuestas Próximas</CardTitle>
            <CardDescription>Encuestas con plazos cercanos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : dashboardData?.upcomingSurveys && dashboardData.upcomingSurveys.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.upcomingSurveys.map((survey) => (
                  <li key={survey.id} className="flex justify-between items-center text-sm">
                    <span>{survey.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(survey.deadline).toLocaleDateString('es-ES')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay encuestas próximas.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Surveys with Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Encuestas</CardTitle>
            <CardDescription>Tasa de finalización de encuestas recientes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : dashboardData?.recentSurveys && dashboardData.recentSurveys.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.recentSurveys.map((survey) => (
                  <li key={survey.id} className="flex justify-between items-center text-sm">
                    <span>{survey.title}</span>
                    <span className="text-muted-foreground">
                      {Math.round(survey.completionRate * 100)}% completado
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos de encuestas recientes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
