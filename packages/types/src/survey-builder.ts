// Types for Survey Builder

// Question type definitions
export type QuestionType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'radio' 
  | 'checkbox'
  | 'date'
  | 'time';

// Validation type definitions
export type ValidationTypes = 
  | 'required' 
  | 'minLength' 
  | 'maxLength'
  | 'minValue'
  | 'maxValue'
  | 'pattern'
  | 'email';

export interface ValidationRule {
  type: ValidationTypes;
  message: string;
  value?: number | string | boolean;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: QuestionOption[];
  validations?: ValidationRule[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface SurveyStructure {
  surveyId: string;
  title: string;
  description?: string;
  version: number;
  sections: Section[];
}
