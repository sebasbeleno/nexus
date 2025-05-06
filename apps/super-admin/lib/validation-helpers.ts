"use client";

import { QuestionType, ValidationTypes } from "@workspace/types";

// Define qué validaciones son aplicables a cada tipo de pregunta
export const getValidValidationTypes = (questionType: QuestionType): ValidationTypes[] => {
  switch (questionType) {
    case 'text':
      return ['required', 'minLength', 'maxLength', 'pattern', 'email'];
    case 'number':
      return ['required', 'minValue', 'maxValue'];
    case 'select':
    case 'multiselect':
    case 'radio':
    case 'checkbox':
      return ['required'];
    case 'date':
    case 'time':
      return ['required'];
    default:
      return ['required'];
  }
};

// Obtiene una descripción legible de cada tipo de validación
export const getValidationDescription = (validationType: ValidationTypes): string => {
  switch (validationType) {
    case 'required':
      return 'Campo obligatorio';
    case 'minLength':
      return 'Longitud mínima';
    case 'maxLength':
      return 'Longitud máxima';
    case 'minValue':
      return 'Valor mínimo';
    case 'maxValue':
      return 'Valor máximo';
    case 'pattern':
      return 'Patrón (expresión regular)';
    case 'email':
      return 'Formato de correo electrónico';
    default:
      return validationType;
  }
};

// Verifica si un tipo específico de validación necesita un valor
export const validationNeedsValue = (validationType: ValidationTypes): boolean => {
  return ['minLength', 'maxLength', 'minValue', 'maxValue', 'pattern'].includes(validationType);
};

// Obtiene el tipo de entrada adecuado para el valor de validación
export const getValidationValueInputType = (validationType: ValidationTypes): string => {
  switch (validationType) {
    case 'minLength':
    case 'maxLength':
    case 'minValue':
    case 'maxValue':
      return 'number';
    default:
      return 'text';
  }
};
