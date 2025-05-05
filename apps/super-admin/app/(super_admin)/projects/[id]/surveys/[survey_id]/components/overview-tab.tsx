"use client";

import { Survey, Property, SurveyResponse } from "@workspace/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { MapPin, FileSpreadsheet, Calendar } from "lucide-react";

interface OverviewTabProps {
  survey: Survey;
  properties: Property[];
  responses: SurveyResponse[];
}

export function OverviewTab({ survey, properties, responses }: OverviewTabProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
