"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

export default function EditSurveyPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id } = use(params);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <Link href={`/projects/${projectId}/surveys/${survey_id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la Encuesta
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Encuesta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editor de Encuesta</CardTitle>
          <CardDescription>Edita la estructura y configuración de la encuesta</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            El editor de encuestas estará disponible pronto. Aquí podrás modificar las preguntas,
            secciones y configuración de la encuesta.
          </p>
          <p className="text-muted-foreground mt-2">
            ID de la encuesta: <span className="font-mono">{survey_id}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
