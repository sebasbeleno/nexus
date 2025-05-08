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

export type ConditionalOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'isEmpty' | 'isNotEmpty';

export type LogicalOperator = 'AND' | 'OR';

export interface ConditionalLogicCondition {
  questionId: string;
  operator: ConditionalOperator;
  value?: string | number | boolean;
}

export interface ConditionalLogic {
  enabled: boolean;
  action: 'show';
  logic: LogicalOperator;
  conditions: ConditionalLogicCondition[];
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
  conditionalLogic?: ConditionalLogic;
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
