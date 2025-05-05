"use client";

import { useMemo } from "react";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { SectionCard } from "./section-card";
import { SurveyMetadataEditor } from "./survey-metadata-editor";
import { Button } from "@workspace/ui/components/button";
import { PlusCircle } from "lucide-react";

export function SurveyBuilder() {
  const { survey, addSection } = useSurveyStore();
  
  const totalQuestions = useMemo(() => {
    return survey.sections.reduce((acc, section) => {
      return acc + section.questions.length;
    }, 0);
  }, [survey.sections]);

  return (
    <div className="space-y-6">
      <SurveyMetadataEditor />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Secciones ({survey.sections.length})</h2>
        <Button onClick={addSection} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Añadir Sección
        </Button>
      </div>

      {survey.sections.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No hay secciones. Haga clic en "Añadir Sección" para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {survey.sections.map((section) => (
            <SectionCard 
              key={section.id} 
              section={section}
              // Placeholder for drag handle props to be implemented later when @formkit/drag-and-drop is installed
              dragHandleProps={{}}
            />
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground text-center mt-6 p-2 bg-muted rounded">
        <p>La funcionalidad de arrastrar y soltar para reordenar secciones estará disponible después de instalar @formkit/drag-and-drop.</p>
      </div>
    </div>
  );
}
