"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Info, Edit2, Trash2, GitBranch } from "lucide-react";
import { Question } from "@workspace/types";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { QuestionEditDialog } from "./question-edit-dialog";
import { QuestionDeleteDialog } from "./question-delete-dialog";

interface QuestionCardProps {
  question: Question;
  sectionId: string;
}

export function QuestionCard({ question, sectionId }: QuestionCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteQuestion } = useSurveyStore();

  const handleDelete = () => {
    deleteQuestion(sectionId, question.id);
    setIsDeleteDialogOpen(false);
  };
  const renderValidations = () => {
    if (!question.validations || question.validations.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {question.validations.map((validation, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    {validation.type}
                    <Info className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{validation.message}</p>
                  {validation.value !== undefined && (
                    <p>Valor: {validation.value.toString()}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Badge>
        ))}
      </div>
    );
  };

  const renderQuestionType = () => (
    <Badge variant="secondary" className="ml-2">
      {question.type}
    </Badge>
  );

  const renderOptions = () => {
    if (!question.options || question.options.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-muted-foreground">
        <p className="font-medium mb-1">Opciones:</p>
        <ul className="list-disc pl-5">
          {question.options.map((option, index) => (
            <li key={index}>{option.label}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  const renderConditionalLogic = () => {
    if (!question.conditionalLogic || !question.conditionalLogic.enabled) return null;
    
    return (
      <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Condicional
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Esta pregunta tiene lógica condicional aplicada.</p>
              <p className="font-medium mt-1">{question.conditionalLogic.logic === "AND" ? "Todas las condiciones" : "Cualquier condición"}</p>
              <p className="text-xs mt-1">{question.conditionalLogic.conditions.length} condicion(es)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Badge>
    );
  };

  return (
    <Card className="mb-3">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center flex-wrap">
            {question.label}
            {renderQuestionType()}
            {renderConditionalLogic()}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditDialogOpen(true)}
              title="Editar pregunta"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Eliminar pregunta"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {question.placeholder && (
          <p className="text-sm text-muted-foreground">
            Placeholder: {question.placeholder}
          </p>
        )}
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
        {renderOptions()}
        {renderValidations()}
      </CardContent>

      {/* Diálogos para edición y eliminación */}
      <QuestionEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sectionId={sectionId}
        questionId={question.id}
      />
      
      <QuestionDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        questionLabel={question.label}
      />
    </Card>
  );
}
