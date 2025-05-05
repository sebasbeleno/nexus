"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Survey } from "@workspace/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  ArrowLeft,
  Clipboard,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";

interface Property {
  id: string;
  address: string;
  property_type: 'house' | 'apartment_building' | 'multi_floor_house';
  location: any; // GeoJSON object
  official_boundary: any; // GeoJSON object
  metadata: Record<string, any> | null;
  creation_method: 'client_provided' | 'surveyor_created' | 'admin_placeholder' | 'unknown';
  created_at: string;
  updated_at: string;
}

interface SurveyResponse {
  id: string;
  assignment_id: string;
  responses: Record<string, any>;
  submitted_at: string;
  location_submitted: any; // GeoJSON object
  metadata: Record<string, any> | null;
  surveyor_notes: string | null;
}

export default function SurveyPage({ params }: { params: { id: string; survey_id: string } }) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const supabase = createClient();

  // Fetch survey data
  const fetchSurveyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', params.survey_id)
        .single();

      if (surveyError) throw surveyError;
      if (!surveyData) throw new Error('Encuesta no encontrada');

      setSurvey(surveyData);

      // Fetch properties associated with the project
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('project_id', params.id);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch survey responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('assignment_id', params.survey_id);

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

    } catch (err: any) {
      console.error("Failed to fetch survey data:", err);
      setError(err.message || "No se pudieron cargar los detalles de la encuesta.");
      setSurvey(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, params.survey_id, supabase]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  const handleCopyId = () => {
    if (survey) {
      navigator.clipboard.writeText(survey.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Encontrado</AlertTitle>
          <AlertDescription>No se pudo encontrar la encuesta solicitada.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col gap-6">
        <Link href={`/projects/${params.id}`}>
          <Button variant="outline" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 w-4 h-4" /> Volver al Proyecto
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{survey.name}</h1>
            <p className="text-muted-foreground">{survey.description || "Sin descripción"}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Versión: {survey.version}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              className="flex items-center gap-1"
            >
              {copySuccess ? (
                <>
                  <ClipboardCheck className="w-4 h-4" /> Copiado
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" /> Copiar ID
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Survey details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="structure">Estructura</TabsTrigger>
          <TabsTrigger value="properties">Propiedades</TabsTrigger>
          <TabsTrigger value="responses">Respuestas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Detalles básicos sobre esta encuesta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ID de Encuesta</p>
                  <p className="text-sm font-mono break-all">{survey.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Versión</p>
                  <p className="text-sm">{survey.version}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p className="text-sm">{new Date(survey.created_at).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                  <p className="text-sm">{new Date(survey.updated_at).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                {survey.deadline && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Fecha Límite</p>
                    <p className="text-sm">{new Date(survey.deadline).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4 text-primary" />
                  Propiedades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-sm text-muted-foreground">Propiedades asociadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  Respuestas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-sm text-muted-foreground">Respuestas recibidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4 text-primary" />
                  Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={survey.deadline && new Date(survey.deadline) < new Date() ? "destructive" : "default"}>
                  {survey.deadline && new Date(survey.deadline) < new Date() ? "Vencida" : "Activa"}
                </Badge>
                {survey.deadline && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(survey.deadline) < new Date() 
                      ? `Venció el ${new Date(survey.deadline).toLocaleDateString('es-ES')}`
                      : `Vence el ${new Date(survey.deadline).toLocaleDateString('es-ES')}`}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Structure Tab */}
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estructura de la Encuesta</CardTitle>
              <CardDescription>Vista detallada de las preguntas y secciones</CardDescription>
            </CardHeader>
            <CardContent>
              {survey.structure ? (
                <pre className="p-4 bg-muted rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(survey.structure, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">Esta encuesta no tiene estructura definida.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propiedades Asociadas</CardTitle>
              <CardDescription>Propiedades relacionadas con esta encuesta</CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay propiedades asociadas a esta encuesta.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Dirección</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Método de Creación</th>
                        <th className="px-4 py-2 text-left">Fecha de Creación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2">{property.address}</td>
                          <td className="px-4 py-2">
                            {property.property_type === 'house' && 'Casa'}
                            {property.property_type === 'apartment_building' && 'Edificio de Apartamentos'}
                            {property.property_type === 'multi_floor_house' && 'Casa de Múltiples Pisos'}
                          </td>
                          <td className="px-4 py-2">
                            {property.creation_method === 'client_provided' && 'Proporcionado por Cliente'}
                            {property.creation_method === 'surveyor_created' && 'Creado por Encuestador'}
                            {property.creation_method === 'admin_placeholder' && 'Marcador de Posición'}
                            {property.creation_method === 'unknown' && 'Desconocido'}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(property.created_at).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Respuestas Recibidas</CardTitle>
              <CardDescription>Respuestas registradas para esta encuesta</CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay respuestas registradas para esta encuesta.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Fecha de Envío</th>
                        <th className="px-4 py-2 text-left">Notas del Encuestador</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response) => (
                        <tr key={response.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2 font-mono text-xs">{response.id.substring(0, 8)}...</td>
                          <td className="px-4 py-2">
                            {new Date(response.submitted_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-2">
                            {response.surveyor_notes ? 
                              (response.surveyor_notes.length > 50 
                                ? `${response.surveyor_notes.substring(0, 50)}...` 
                                : response.surveyor_notes) 
                              : 'Sin notas'}
                          </td>
                          <td className="px-4 py-2">
                            <Button variant="outline" size="sm">
                              Ver Detalles
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
