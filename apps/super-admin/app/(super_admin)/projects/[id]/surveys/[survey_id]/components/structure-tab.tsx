"use client";

import { Survey } from "@workspace/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Edit } from "lucide-react";
import Link from "next/link";

interface StructureTabProps {
  survey: Survey;
  projectId: string;
}

export function StructureTab({ survey, projectId }: StructureTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Estructura de la Encuesta</CardTitle>
            <CardDescription>Vista detallada de las preguntas y secciones</CardDescription>
          </div>
          <Link href={`/projects/${projectId}/surveys/${survey.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit className="w-4 h-4" /> Editar
            </Button>
          </Link>
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
    </div>
  );
}
