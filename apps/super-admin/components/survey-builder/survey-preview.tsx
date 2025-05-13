"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Section, Question, QuestionType, ValidationTypes, ConditionalLogic } from "@workspace/types";
import { toast } from "sonner";

interface SurveyPreviewProps {
  sections: Section[];
  onComplete: (responses: Record<string, any>) => void;
}

export function SurveyPreview({ sections, onComplete }: SurveyPreviewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Generate dynamic schema for the current section
  const generateSectionSchema = (section: Section) => {
    const schemaFields: Record<string, any> = {};

    section.questions.forEach(question => {
      // Skip questions that should be hidden based on conditional logic
      if (!shouldShowQuestion(question)) {
        return;
      }

      let fieldSchema: any;

      switch (question.type) {
        case 'text':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'date':
          fieldSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
            message: "Formato de fecha inválido",
          });
          break;
        case 'select':
        case 'radio':
          fieldSchema = z.string();
          break;
        case 'multiselect':
        case 'checkbox':
          fieldSchema = z.array(z.string()).default([]);
          break;
        case 'time':
          fieldSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Formato de hora inválido (HH:MM)",
          });
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply validations
      if (question.validations?.length) {
        question.validations.forEach(validation => {
          switch (validation.type) {
            case 'required':
              // Use the correct method based on schema type
              if (question.type === 'text' || question.type === 'select' || question.type === 'radio' || question.type === 'date' || question.type === 'time') {
                fieldSchema = z.string().min(1, validation.message || "Este campo es obligatorio");
              } else if (question.type === 'multiselect' || question.type === 'checkbox') {
                fieldSchema = z.array(z.string()).min(1, validation.message || "Este campo es obligatorio");
              } else if (question.type === 'number') {
                fieldSchema = fieldSchema.refine((val: number | undefined) => val !== undefined && val !== null, {
                  message: validation.message || "Este campo es obligatorio"
                });
              }
              break;
            case 'minLength':
              if (typeof validation.value === 'number') {
                if (question.type === 'text' || question.type === 'select' || question.type === 'radio' || question.type === 'date' || question.type === 'time') {
                  fieldSchema = z.string().min(validation.value, validation.message || `Mínimo ${validation.value} caracteres`);
                } else if (question.type === 'multiselect' || question.type === 'checkbox') {
                  fieldSchema = z.array(z.string()).min(validation.value, validation.message || `Seleccione al menos ${validation.value} opciones`);
                }
              }
              break;
            case 'maxLength':
              if (typeof validation.value === 'number') {
                if (question.type === 'text' || question.type === 'select' || question.type === 'radio' || question.type === 'date' || question.type === 'time') {
                  fieldSchema = z.string().max(validation.value, validation.message || `Máximo ${validation.value} caracteres`);
                } else if (question.type === 'multiselect' || question.type === 'checkbox') {
                  fieldSchema = z.array(z.string()).max(validation.value, validation.message || `Seleccione como máximo ${validation.value} opciones`);
                }
              }
              break;
            case 'email':
              if (question.type === 'text') {
                fieldSchema = z.string().email(validation.message || "Formato de correo electrónico inválido");
              }
              break;
          }
        });
      } else if (question.required) {
        // Handle required fields
        if (question.type === 'text' || question.type === 'select' || question.type === 'radio' || question.type === 'date' || question.type === 'time') {
          fieldSchema = z.string().min(1, "Este campo es obligatorio");
        } else if (question.type === 'multiselect' || question.type === 'checkbox') {
          fieldSchema = z.array(z.string()).min(1, "Este campo es obligatorio");
        } else if (question.type === 'number') {
          fieldSchema = fieldSchema.refine((val: number | undefined) => val !== undefined && val !== null, {
            message: "Este campo es obligatorio"
          });
        }
      } else {
        // If not required, make it optional
        if (question.type === 'text' || question.type === 'select' || question.type === 'radio' || question.type === 'date' || question.type === 'time') {
          fieldSchema = z.string().optional();
        } else if (question.type === 'multiselect' || question.type === 'checkbox') {
          fieldSchema = z.array(z.string()).default([]);
        } else if (question.type === 'number') {
          fieldSchema = z.number().optional();
        }
      }

      schemaFields[question.id] = fieldSchema;
    });

    return z.object(schemaFields);
  };

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic || !question.conditionalLogic.enabled) {
      return true;
    }

    const { conditionalLogic } = question;
    const { conditions, logic } = conditionalLogic;

    const evaluateCondition = (condition: any) => {
      const { questionId, operator, value } = condition;
      const response = responses[questionId];

      if (response === undefined) return false;

      switch (operator) {
        case 'equals':
          return response === value;
        case 'notEquals':
          return response !== value;
        case 'greaterThan':
          return response > value;
        case 'lessThan':
          return response < value;
        case 'contains':
          return Array.isArray(response)
            ? response.includes(value)
            : String(response).includes(String(value));
        case 'isEmpty':
          return response === '' || response === null || 
                 (Array.isArray(response) && response.length === 0);
        case 'isNotEmpty':
          return response !== '' && response !== null && 
                 (!Array.isArray(response) || response.length > 0);
        default:
          return false;
      }
    };

    if (logic === 'AND') {
      return conditions.every(evaluateCondition);
    } else {
      return conditions.some(evaluateCondition);
    }
  };

  // Create form
  const currentSchema = currentSection ? generateSectionSchema(currentSection) : z.object({});
  const form = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: responses,
  });

  // Update form values when section changes or responses are updated
  useEffect(() => {
    const sectionResponses = Object.keys(responses).reduce((acc, key) => {
      const questionIds = currentSection.questions.map(q => q.id);
      if (questionIds.includes(key)) {
        acc[key] = responses[key];
      }
      return acc;
    }, {} as Record<string, any>);

    Object.keys(sectionResponses).forEach(key => {
      form.setValue(key, sectionResponses[key]);
    });
  }, [currentSection, responses, form]);

  // Handle navigation between sections
  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Por favor, corrija los errores antes de continuar");
      return;
    }

    const sectionResponses = form.getValues();
    setResponses(prev => ({
      ...prev,
      ...sectionResponses
    }));

    if (isLastSection) {
      setIsSubmitting(true);
      try {
        onComplete({
          ...responses,
          ...sectionResponses
        });
      } catch (error) {
        console.error("Error completing preview:", error);
        toast.error("Error al completar la vista previa");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentSectionIndex(prevIndex => prevIndex + 1);
    }
  };

  const renderQuestion = (question: Question) => {
    // Check if question should be shown based on conditional logic
    if (!shouldShowQuestion(question)) {
      return null;
    }

    switch (question.type) {
      case 'text':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <FormControl>
                  <Input placeholder={question.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <FormControl>
                  <Input type="number" placeholder={question.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={question.placeholder || "Seleccionar opción"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'radio':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {question.options?.map(option => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <FormLabel htmlFor={`${question.id}-${option.value}`} className="font-normal">
                          {option.label}
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <div className="space-y-2">
                  {question.options?.map(option => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name={question.id}
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, option.value])
                                    : field.onChange(
                                        currentValue.filter(
                                          (value: string) => value !== option.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <FormControl>
                  <Input type="date" placeholder={question.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'time':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                <FormControl>
                  <Input type="time" placeholder={question.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  if (!currentSection) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">No hay secciones para previsualizar</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{currentSection.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Sección {currentSectionIndex + 1} de {sections.length}
          </div>
        </div>
        {currentSection.description && (
          <p className="text-muted-foreground">{currentSection.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {currentSection.questions.map(renderQuestion)}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstSection}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              {isLastSection ? "Completar" : "Siguiente"} <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
