"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";

import type { Survey } from "@workspace/types";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { CreateSurveyDialog } from "@/components/create-survey-dialog";
import { createClient } from "@/utils/supabase/client";

interface SurveysTabProps {
  projectId: string;
}

export function SurveysTab({ projectId }: SurveysTabProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSurveyDialog, setShowCreateSurveyDialog] = useState(false);

  const supabase = createClient();

  const fetchSurveys = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('surveys')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setSurveys(data || []);
    } catch (err: any) {
      console.error("Failed to fetch surveys:", err);
      setError("No se pudieron cargar las encuestas. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, supabase]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Encuestas</h2>
        <Button size="sm" onClick={() => setShowCreateSurveyDialog(true)}>
          <PlusCircle className="mr-2 size-4" /> Crear Encuesta
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error al Cargar Encuestas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : surveys.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <h3 className="text-lg font-medium">Aún no hay Encuestas</h3>
            <p className="text-muted-foreground text-sm mb-4">Empieza creando tu primera encuesta.</p>
            <Button size="sm" onClick={() => setShowCreateSurveyDialog(true)}>
              <PlusCircle className="mr-2 size-4" /> Crear Encuesta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <CardTitle>{survey.name}</CardTitle>
                <CardDescription>{survey.description || "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Versión: {survey.version}</Badge>
                {survey.deadline && (
                  <Badge variant="outline" className="ml-2">
                    Vence: {new Date(survey.deadline).toLocaleDateString('es-ES')}
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/projects/${projectId}/surveys/${survey.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalles
                  </Button>
                </Link>
                {/* Add Edit/Delete buttons later */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateSurveyDialog
        projectId={projectId}
        open={showCreateSurveyDialog}
        onOpenChange={setShowCreateSurveyDialog}
        onSurveyCreated={fetchSurveys}
      />
    </div>
  );
}
