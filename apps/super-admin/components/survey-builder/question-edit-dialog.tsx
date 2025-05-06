"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { Question, ValidationRule, ValidationTypes, QuestionOption } from "@workspace/types";
import { getValidValidationTypes, getValidationDescription, validationNeedsValue, getValidationValueInputType } from "@/lib/validation-helpers";
import { Plus, X, Trash2 } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

interface QuestionEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  questionId: string;
}

export function QuestionEditDialog({
  isOpen,
  onOpenChange,
  sectionId,
  questionId,
}: QuestionEditDialogProps) {
  const { survey, updateQuestion } = useSurveyStore();
  
  // Estados para los campos de la pregunta
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [validations, setValidations] = useState<ValidationRule[]>([]);
  const [questionType, setQuestionType] = useState<string>("");
  
  // Estado para un nuevo campo de validación
  const [newValidationType, setNewValidationType] = useState<ValidationTypes>("required");
  const [newValidationMessage, setNewValidationMessage] = useState("");
  const [newValidationValue, setNewValidationValue] = useState<string | number>("");
  
  // Estado para un nuevo campo de opción
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Carga los datos de la pregunta actual cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && sectionId && questionId) {
      const section = survey.sections.find((s) => s.id === sectionId);
      const question = section?.questions.find((q) => q.id === questionId);

      if (question) {
        setLabel(question.label || "");
        setPlaceholder(question.placeholder || "");
        setDescription(question.description || "");
        setOptions(question.options || []);
        setValidations(question.validations || []);
        setQuestionType(question.type);
      }
    }
  }, [isOpen, sectionId, questionId, survey.sections]);

  // Obtiene los tipos de validación válidos para el tipo de pregunta actual
  const validValidationTypes = getValidValidationTypes(questionType as any);

  // Guardar los cambios
  const handleSave = () => {
    const updates: Partial<Question> = {
      label,
      placeholder: placeholder || undefined,
      description: description || undefined,
      // Siempre actualizamos las validaciones, incluso cuando se han eliminado todas
      validations: validations.length > 0 ? validations : [],
    };

    // Actualizamos opciones si existen
    if (options.length > 0) {
      updates.options = options;
    } else if (questionRequiresOptions) {
      // Si el tipo de pregunta requiere opciones pero no hay ninguna, establecer como undefined
      updates.options = undefined;
    }

    updateQuestion(sectionId, questionId, updates);
    onOpenChange(false);
  };

  // Añadir una nueva validación
  const handleAddValidation = () => {
    if (!newValidationType || !newValidationMessage) return;

    const newValidation: ValidationRule = {
      type: newValidationType,
      message: newValidationMessage,
    };

    if (validationNeedsValue(newValidationType) && newValidationValue !== "") {
      newValidation.value = 
        ["minValue", "maxValue", "minLength", "maxLength"].includes(newValidationType)
          ? Number(newValidationValue)
          : newValidationValue;
    }

    setValidations([...validations, newValidation]);
    setNewValidationType("required");
    setNewValidationMessage("");
    setNewValidationValue("");
  };

  // Eliminar una validación
  const handleRemoveValidation = (index: number) => {
    const newValidations = [...validations];
    newValidations.splice(index, 1);
    setValidations(newValidations);
  };

  // Añadir una nueva opción
  const handleAddOption = () => {
    if (!newOptionLabel || !newOptionValue) return;

    setOptions([...options, { 
      label: newOptionLabel, 
      value: newOptionValue 
    }]);
    
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  // Eliminar una opción
  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  // Verifica si el tipo de pregunta actual necesita opciones
  const questionRequiresOptions = ['select', 'multiselect', 'radio', 'checkbox'].includes(questionType);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Pregunta</DialogTitle>
          <DialogDescription>
            Modifica las propiedades o validaciones de la pregunta.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="properties" className="mt-4">
          <TabsList className="mb-4 w-full">
            <TabsTrigger className="flex-1" value="properties">Propiedades</TabsTrigger>
            <TabsTrigger className="flex-1" value="validations">Validaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-label">Texto de la pregunta</Label>
                <Input
                  id="question-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Introduce el texto de la pregunta"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="question-placeholder">Placeholder (opcional)</Label>
                <Input
                  id="question-placeholder"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="Ejemplo: Introduzca su respuesta aquí"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="question-description">Descripción (opcional)</Label>
                <Textarea
                  id="question-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica detalles adicionales sobre la pregunta"
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              {questionRequiresOptions && (
                <div className="space-y-2">
                  <Label>Opciones</Label>
                  <div className="flex flex-col gap-4">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...options];
                            if (newOptions[index]) {
                              newOptions[index].label = e.target.value;
                              setOptions(newOptions);
                            }
                          }}
                          placeholder="Etiqueta"
                          className="flex-1"
                        />
                        <Input
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...options];
                            if (newOptions[index]) {
                              newOptions[index].value = e.target.value;
                              setOptions(newOptions);
                            }
                          }}
                          placeholder="Valor"
                          className="w-1/3"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        placeholder="Nueva etiqueta"
                        className="flex-1"
                      />
                      <Input
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="Nuevo valor"
                        className="w-1/3"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddOption}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="validations" className="space-y-4">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-4">
                <div>
                  <Label className="block mb-2">Validaciones Actuales</Label>
                  {validations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay validaciones configuradas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {validations.map((validation, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-2 px-2 py-1">
                          <span>
                            {getValidationDescription(validation.type)}
                            {validation.value !== undefined && `: ${validation.value}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveValidation(index)}
                            className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Label className="block mb-2">Añadir Nueva Validación</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Select
                      value={newValidationType}
                      onValueChange={(value) => setNewValidationType(value as ValidationTypes)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de validación" />
                      </SelectTrigger>
                      <SelectContent>
                        {validValidationTypes.map((type) => (
                          <SelectItem key={type} value={type}>{getValidationDescription(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {validationNeedsValue(newValidationType) && (
                      <Input
                        type={getValidationValueInputType(newValidationType)}
                        value={newValidationValue}
                        onChange={(e) => setNewValidationValue(e.target.value)}
                        placeholder="Valor"
                      />
                    )}

                    <Input
                      value={newValidationMessage}
                      onChange={(e) => setNewValidationMessage(e.target.value)}
                      placeholder="Mensaje de error"
                      className="md:col-span-2"
                    />
                  </div>
                  <Button
                    onClick={handleAddValidation}
                    className="mt-2"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Añadir Validación
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
