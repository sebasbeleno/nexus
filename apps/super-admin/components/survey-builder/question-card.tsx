"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Info } from "lucide-react";
import { Question } from "@workspace/types";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
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

  return (
    <Card className="mb-3">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center">
          {question.label}
          {renderQuestionType()}
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
    </Card>
  );
}
