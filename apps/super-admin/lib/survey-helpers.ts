"use client";

import { ConditionalOperator, Question, Section } from "@workspace/types";

/**
 * Gets a question by ID from all sections in the survey
 * @param questionId The ID of the question to find
 * @param sections All sections in the survey
 * @returns The question object if found, or undefined if not found
 */
export function getQuestionById(questionId: string, sections: Section[]): Question | undefined {
  for (const section of sections) {
    const question = section.questions.find(q => q.id === questionId);
    if (question) return question;
  }
  return undefined;
}

/**
 * Gets the human-readable description for a conditional operator
 * @param operator The conditional operator
 * @returns Human-readable description in Spanish
 */
export function getConditionalOperatorDescription(operator: ConditionalOperator): string {
  const descriptions: Record<ConditionalOperator, string> = {
    'equals': 'es igual a',
    'notEquals': 'no es igual a',
    'greaterThan': 'mayor que',
    'lessThan': 'menor que',
    'contains': 'contiene',
    'isEmpty': 'está vacío',
    'isNotEmpty': 'no está vacío'
  };
  
  return descriptions[operator] || operator;
}

/**
 * Checks if a conditional operator requires a comparison value
 * @param operator The conditional operator to check
 * @returns Whether the operator requires a value
 */
export function operatorNeedsValue(operator: ConditionalOperator): boolean {
  return !['isEmpty', 'isNotEmpty'].includes(operator);
}
