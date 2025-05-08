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
import { Question, ValidationRule, ValidationTypes, QuestionOption, ConditionalLogic, ConditionalOperator, LogicalOperator, ConditionalLogicCondition, QuestionType } from "@workspace/types";
import { getValidValidationTypes, getValidationDescription, validationNeedsValue, getValidationValueInputType } from "@/lib/validation-helpers";
import { Plus, X, Trash2, Check } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Switch } from "@workspace/ui/components/switch";
import { getQuestionById, getConditionalOperatorDescription, operatorNeedsValue } from "@/lib/survey-helpers";

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
  
  // Estados para lógica condicional
  const [conditionalLogicEnabled, setConditionalLogicEnabled] = useState(false);
  const [conditionalAction, setConditionalAction] = useState<'show'>('show');
  const [conditionalLogic, setConditionalLogic] = useState<LogicalOperator>('AND');
  const [conditionalConditions, setConditionalConditions] = useState<ConditionalLogicCondition[]>([]);
  
  // Estado para una nueva condición
  const [newConditionQuestionId, setNewConditionQuestionId] = useState<string>('no-selection');
  const [newConditionOperator, setNewConditionOperator] = useState<ConditionalOperator>('equals');
  const [newConditionValue, setNewConditionValue] = useState<string>('');

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
        
        // Cargar datos de lógica condicional
        if (question.conditionalLogic) {
          setConditionalLogicEnabled(question.conditionalLogic.enabled);
          setConditionalAction(question.conditionalLogic.action);
          setConditionalLogic(question.conditionalLogic.logic);
          setConditionalConditions(question.conditionalLogic.conditions || []);
        } else {
          // Valores predeterminados
          setConditionalLogicEnabled(false);
          setConditionalAction('show');
          setConditionalLogic('AND');
          setConditionalConditions([]);
        }
        
        // Resetear los valores del formulario de nuevas condiciones
        setNewConditionQuestionId('no-selection');
        setNewConditionOperator('equals');
        setNewConditionValue('');
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
    
    // Actualizamos la lógica condicional
    if (conditionalLogicEnabled && conditionalConditions.length > 0) {
      updates.conditionalLogic = {
        enabled: true,
        action: conditionalAction,
        logic: conditionalLogic,
        conditions: conditionalConditions
      };
    } else {
      // Si la lógica condicional está desactivada, la establecemos como undefined
      updates.conditionalLogic = undefined;
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

  // Añadir una nueva condición
  const handleAddCondition = () => {
    if (!newConditionQuestionId || newConditionQuestionId === 'no-selection' || newConditionQuestionId === 'no-questions') return;
    
    const newCondition: ConditionalLogicCondition = {
      questionId: newConditionQuestionId,
      operator: newConditionOperator,
    };
    
    // Solo agregamos el valor si el operador no es isEmpty o isNotEmpty
    if (newConditionOperator !== 'isEmpty' && newConditionOperator !== 'isNotEmpty' && newConditionValue) {
      newCondition.value = newConditionValue;
    }
    
    setConditionalConditions([...conditionalConditions, newCondition]);
    setNewConditionQuestionId('no-selection');
    setNewConditionOperator('equals');
    setNewConditionValue('');
  };
  
  // Eliminar una condición
  const handleRemoveCondition = (index: number) => {
    const newConditions = [...conditionalConditions];
    newConditions.splice(index, 1);
    setConditionalConditions(newConditions);
  };
  
  // Obtener todas las preguntas disponibles excepto la actual
  const availableQuestions = survey.sections.flatMap(section => 
    section.questions.filter(q => q.id !== questionId)
  );
  
  // Obtener el tipo de pregunta seleccionada como trigger
  const getTriggerQuestionType = (questionId: string): QuestionType | null => {
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question.type;
    }
    return null;
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
            <TabsTrigger className="flex-1" value="conditionals">Condicionales</TabsTrigger>
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
          
          <TabsContent value="conditionals" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="conditional-logic-enabled"
                    checked={conditionalLogicEnabled} 
                    onCheckedChange={setConditionalLogicEnabled}
                  />
                  <Label htmlFor="conditional-logic-enabled">Habilitar lógica condicional</Label>
                </div>
                
                {conditionalLogicEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Acción</Label>
                      <Select 
                        value={conditionalAction} 
                        onValueChange={(value) => setConditionalAction(value as 'show')}
                        disabled={true} // Solo hay una opción por ahora
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar acción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">Mostrar</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Esto determinará qué hacer con esta pregunta cuando se cumplan las condiciones.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Operador lógico</Label>
                      <Select 
                        value={conditionalLogic} 
                        onValueChange={(value) => setConditionalLogic(value as LogicalOperator)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">Todas las condiciones (AND)</SelectItem>
                          <SelectItem value="OR">Cualquier condición (OR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Determina si deben cumplirse todas las condiciones o solo alguna de ellas.</p>
                    </div>
                    
                    <div>
                      <Label className="block mb-2">Condiciones Actuales</Label>
                      {conditionalConditions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hay condiciones configuradas.</p>
                      ) : (
                        <div className="space-y-2">
                          {conditionalConditions.map((condition, index) => {
                            // Encontrar la pregunta relacionada para mostrar su etiqueta
                            const triggerQuestion = availableQuestions.find(q => q.id === condition.questionId);
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">{triggerQuestion?.label || "Pregunta desconocida"}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {getConditionalOperatorDescription(condition.operator)}
                                    {' '}
                                    {condition.value !== undefined ? <strong>{condition.value}</strong> : ''}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveCondition(index)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Label className="block mb-2">Añadir Nueva Condición</Label>
                      <div className="space-y-3">
                        <div>
                          <Label>Pregunta disparadora</Label>
                          <Select
                            value={newConditionQuestionId}
                            onValueChange={setNewConditionQuestionId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar pregunta" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableQuestions.length === 0 ? (
                                <SelectItem value="no-questions" disabled>No hay preguntas disponibles</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="no-selection" disabled>Seleccione una pregunta</SelectItem>
                                  {availableQuestions.map((question) => (
                                    <SelectItem key={question.id} value={question.id}>
                                      {question.label}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Operador</Label>
                          <Select
                            value={newConditionOperator}
                            onValueChange={(value) => setNewConditionOperator(value as ConditionalOperator)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar operador" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Es igual a</SelectItem>
                              <SelectItem value="notEquals">No es igual a</SelectItem>
                              <SelectItem value="greaterThan">Mayor que</SelectItem>
                              <SelectItem value="lessThan">Menor que</SelectItem>
                              <SelectItem value="contains">Contiene</SelectItem>
                              <SelectItem value="isEmpty">Está vacío</SelectItem>
                              <SelectItem value="isNotEmpty">No está vacío</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {operatorNeedsValue(newConditionOperator) && (
                          <div>
                            <Label>Valor</Label>
                            {getTriggerQuestionType(newConditionQuestionId) === 'select' || 
                             getTriggerQuestionType(newConditionQuestionId) === 'radio' ||
                             getTriggerQuestionType(newConditionQuestionId) === 'multiselect' ||
                             getTriggerQuestionType(newConditionQuestionId) === 'checkbox' ? (
                              // Si la pregunta trigger es de tipo select/radio/checkbox, mostramos sus opciones
                              <Select
                                value={newConditionValue}
                                onValueChange={setNewConditionValue}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar valor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableQuestions
                                    .find(q => q.id === newConditionQuestionId)
                                    ?.options?.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                             ) : (
                              // Para otros tipos, mostramos un input
                              <Input
                                value={newConditionValue}
                                onChange={(e) => setNewConditionValue(e.target.value)}
                                placeholder="Valor para comparar"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={handleAddCondition}
                        className="mt-3"
                        variant="outline"
                        size="sm"
                        disabled={!newConditionQuestionId || (operatorNeedsValue(newConditionOperator) && !newConditionValue)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Añadir Condición
                      </Button>
                    </div>
                  </div>
                )}
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
