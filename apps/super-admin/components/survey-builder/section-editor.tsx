"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { QuestionCard } from "./question-card";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";

interface SectionEditorProps {
  sectionId: string | undefined;
}

export function SectionEditor({ sectionId }: SectionEditorProps) {
  const { survey } = useSurveyStore();
  
  const currentSection = sectionId 
    ? survey.sections.find((s) => s.id === sectionId) 
    : undefined;
  
  if (!currentSection) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Alert variant="default" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No hay sección seleccionada</AlertTitle>
            <AlertDescription>
              Selecciona una sección para ver y editar sus preguntas, o crea una nueva sección.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {currentSection.title}
        </CardTitle>
        {currentSection.description && (
          <p className="text-sm text-muted-foreground">{currentSection.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {currentSection.questions.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Esta sección no tiene preguntas. Añade preguntas utilizando los tipos disponibles.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSection.questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                sectionId={currentSection.id} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
