"use client";

import { useState } from "react";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { Card, CardHeader, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Edit2, Check } from "lucide-react";

export function SurveyMetadataEditor() {
  const { survey, updateSurveyTitle, updateSurveyDescription } = useSurveyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(survey.title);
  const [editingDescription, setEditingDescription] = useState(survey.description || "");

  const handleSave = () => {
    updateSurveyTitle(editingTitle);
    updateSurveyDescription(editingDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingTitle(survey.title);
    setEditingDescription(survey.description || "");
    setIsEditing(false);
  };

  const totalQuestions = survey.sections.reduce(
    (acc, section) => acc + section.questions.length, 
    0
  );

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="space-y-2 w-full">
            <Input 
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Título de la encuesta"
              className="text-xl font-semibold"
            />
            <Textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              placeholder="Descripción de la encuesta"
              className="resize-none"
              rows={3}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="text-sm bg-muted px-2 py-1 rounded">
              ID: <span className="font-mono">{survey.surveyId}</span>
            </div>
            <div className="text-sm bg-muted px-2 py-1 rounded">
              Versión: {survey.version}
            </div>
            <div className="text-sm bg-muted px-2 py-1 rounded">
              {survey.sections.length} secciones
            </div>
            <div className="text-sm bg-muted px-2 py-1 rounded">
              {totalQuestions} preguntas
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} size="sm">
              <Check className="mr-2 h-4 w-4" /> Guardar
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="relative">
        <div>
          <h2 className="text-xl font-semibold">{survey.title}</h2>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Editar metadatos</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="text-sm bg-muted px-2 py-1 rounded">
            ID: <span className="font-mono">{survey.surveyId}</span>
          </div>
          <div className="text-sm bg-muted px-2 py-1 rounded">
            Versión: {survey.version}
          </div>
          <div className="text-sm bg-muted px-2 py-1 rounded">
            {survey.sections.length} secciones
          </div>
          <div className="text-sm bg-muted px-2 py-1 rounded">
            {totalQuestions} preguntas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
