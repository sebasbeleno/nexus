"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Section, Question, SurveyStructure } from "@workspace/types";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

interface ResponseSummaryProps {
  survey: SurveyStructure;
  responses: Record<string, any>;
  onBack: () => void;
}

export function ResponseSummary({ survey, responses, onBack }: ResponseSummaryProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getQuestionById = (questionId: string): Question | undefined => {
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return undefined;
  };

  const formatResponseValue = (questionId: string, value: any): string => {
    const question = getQuestionById(questionId);
    
    if (!question) return JSON.stringify(value);

    if (value === undefined || value === null || value === '') {
      return "—";
    }

    switch (question.type) {
      case 'select':
      case 'radio':
        const option = question.options?.find(o => o.value === value);
        return option ? option.label : value;
      
      case 'multiselect':
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.map(v => {
            const option = question.options?.find(o => o.value === v);
            return option ? option.label : v;
          }).join(", ");
        }
        return String(value);
      
      case 'date':
        try {
          return new Date(value).toLocaleDateString('es-ES');
        } catch (e) {
          return value;
        }
      
      default:
        return String(value);
    }
  };

  const handleExportResponses = () => {
    try {
      // Format the data for export
      const formattedResponses: Record<string, any> = {};
      
      Object.keys(responses).forEach(questionId => {
        const question = getQuestionById(questionId);
        if (question) {
          formattedResponses[question.label] = formatResponseValue(questionId, responses[questionId]);
        }
      });
      
      // Create JSON file
      const dataStr = JSON.stringify(formattedResponses, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create download link
      const exportFileName = `${survey.title.replace(/\s+/g, '_')}_preview_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      toast.success("Respuestas exportadas correctamente");
    } catch (error) {
      console.error("Error exporting responses:", error);
      toast.error("Error al exportar las respuestas");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resumen de Respuestas</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportResponses}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardTitle>
        <p className="text-muted-foreground">
          Vista previa de las respuestas enviadas para la encuesta "{survey.title}"
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {survey.sections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false; // Default to expanded
          const sectionQuestions = section.questions.filter(q => q.id in responses);
          
          if (sectionQuestions.length === 0) return null;
          
          return (
            <div key={section.id} className="border rounded-lg">
              <div 
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50",
                  isExpanded ? "border-b" : ""
                )}
                onClick={() => toggleSection(section.id)}
              >
                <h3 className="font-medium">{section.title}</h3>
                <div className="text-muted-foreground">
                  {isExpanded ? "▼" : "►"} {sectionQuestions.length} {sectionQuestions.length === 1 ? "pregunta" : "preguntas"}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {sectionQuestions.map((question) => (
                    <div key={question.id} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                      <div className="col-span-1 font-medium">{question.label}</div>
                      <div className="col-span-2">
                        {formatResponseValue(question.id, responses[question.id])}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la encuesta
        </Button>
      </CardFooter>
    </Card>
  );
}
