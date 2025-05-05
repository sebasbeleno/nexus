"use client";

import { SurveyResponse } from "@workspace/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

interface ResponsesTabProps {
  responses: SurveyResponse[];
}

export function ResponsesTab({ responses }: ResponsesTabProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
