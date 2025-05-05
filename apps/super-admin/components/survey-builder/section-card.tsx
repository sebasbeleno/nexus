"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card";
import { QuestionCard } from "./question-card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import { Edit2, Trash2, GripVertical, Check, X } from "lucide-react";
import { Section } from "@workspace/types";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";

interface SectionCardProps {
  section: Section;
  dragHandleProps?: any;
}

export function SectionCard({ section, dragHandleProps }: SectionCardProps) {
  const { updateSectionTitle, updateSectionDescription, deleteSection } = useSurveyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || "");

  const handleSaveEdit = () => {
    updateSectionTitle(section.id, title);
    updateSectionDescription(section.id, description);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(section.title);
    setDescription(section.description || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteSection(section.id);
  };

  return (
    <Card className="mb-6 relative">
      {dragHandleProps && (
        <div 
          className="absolute top-4 left-3 cursor-grab active:cursor-grabbing" 
          {...dragHandleProps}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader className={dragHandleProps ? "pl-10" : ""}>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la sección"
              className="font-semibold"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la sección"
              className="resize-none"
              rows={2}
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="h-4 w-4 mr-1" /> Guardar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <CardTitle>{section.title}</CardTitle>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Editar sección</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Eliminar sección</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta sección?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará la sección "{section.title}" y todas sus preguntas. 
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {section.questions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Esta sección no tiene preguntas. Añade preguntas para comenzar.
            </div>
          ) : (
            section.questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
