"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { QuestionCard } from "./question-card";
import { SortableQuestionCard } from "./sortable-question-card";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";

interface SectionEditorProps {
  sectionId: string | undefined;
}

export function SectionEditor({ sectionId }: SectionEditorProps) {
  const { survey, reorderQuestions } = useSurveyStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentSection.questions.findIndex((q) => q.id === active.id);
      const newIndex = currentSection.questions.findIndex((q) => q.id === over.id);

      const newOrder = arrayMove(
        currentSection.questions.map((q) => q.id),
        oldIndex,
        newIndex
      );

      reorderQuestions(currentSection.id, newOrder);
      toast.success("Orden de preguntas actualizado");
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };
  
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={currentSection.questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentSection.questions.map((question) => (
                  <SortableQuestionCard
                    key={question.id} 
                    question={question} 
                    sectionId={currentSection.id}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="opacity-50">
                  <QuestionCard 
                    question={currentSection.questions.find(q => q.id === activeId)!}
                    sectionId={currentSection.id}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
