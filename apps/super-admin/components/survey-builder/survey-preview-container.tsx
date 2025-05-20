"use client";

import { useState } from "react";
import { SurveyStructure } from "@workspace/types";
import { SurveyPreview } from "./survey-preview-fixed";
import { ResponseSummary } from "./response-summary";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

interface SurveyPreviewContainerProps {
  survey: SurveyStructure;
  onClose: () => void;
}

export function SurveyPreviewContainer({ survey, onClose }: SurveyPreviewContainerProps) {
  const [isPreviewComplete, setIsPreviewComplete] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  const handlePreviewComplete = (responses: Record<string, any>) => {
    console.log("Preview responses:", responses);
    setPreviewResponses(responses);
    setIsPreviewComplete(true);
  };

  const handleBackToPreview = () => {
    setIsPreviewComplete(false);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vista previa de la encuesta</h2>
        <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver al editor
        </Button>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          <strong>Modo vista previa:</strong> Este es un entorno de prueba que permite visualizar la encuesta como la verán los usuarios. 
          Las respuestas no se guardarán.
        </p>
        
        {survey.sections.some(section => section.questions.some(q => q.conditionalLogic?.enabled)) && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Lógica condicional activada:</strong> Algunas preguntas aparecerán o se ocultarán 
            según las respuestas que proporcione.
          </p>
        )}
        
        {survey.sections.some(section => section.questions.some(q => q.hasOtherOption)) && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Opción "Otro" disponible:</strong> Algunas preguntas permiten especificar 
            respuestas personalizadas.
          </p>
        )}
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto">
        {!isPreviewComplete ? (
          <SurveyPreview 
            sections={survey.sections} 
            onComplete={handlePreviewComplete}
          />
        ) : (
          <ResponseSummary 
            survey={survey}
            responses={previewResponses}
            onBack={handleBackToPreview}
          />
        )}
      </div>
    </div>
  );
}
