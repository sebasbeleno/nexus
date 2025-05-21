"use client";

import { Section, SurveyStructure, Question, QuestionType } from "@workspace/types";
import { create } from "zustand";


interface SurveyStore {
	survey: SurveyStructure;
	setSurvey: (survey: SurveyStructure) => void;
	updateSurveyTitle: (title: string) => void;
	updateSurveyDescription: (description: string) => void;

	// Section actions
	addSection: () => void;
	deleteSection: (id: string) => void;
	updateSectionTitle: (id: string, title: string) => void;
	updateSectionDescription: (id: string, description: string) => void;
	reorderSections: (orderedIds: string[]) => void;

	// Question actions
	addQuestion: (sectionId: string, type: QuestionType) => void;
	deleteQuestion: (sectionId: string, questionId: string) => void;
	updateQuestion: (sectionId: string, questionId: string, question: Partial<Question>) => void;
	reorderQuestions: (sectionId: string, orderedIds: string[]) => void;
}

// Empty survey structure template
const emptyStructure: SurveyStructure = {
	surveyId: "",
	title: "Nueva Encuesta",
	description: "",
	version: 1,
	sections: []
};

// Helper function to generate a unique ID
function generateId(prefix: string = 'section_'): string {
	return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
	survey: emptyStructure,
	setSurvey: (survey) => set({ survey }),

	updateSurveyTitle: (title) =>
		set((state) => ({
			survey: { ...state.survey, title }
		})),

	updateSurveyDescription: (description) =>
		set((state) => ({
			survey: { ...state.survey, description }
		})),

	// Section actions
	addSection: () =>
		set((state) => {
			const newSection = {
				id: generateId(),
				title: "Nueva Sección",
				description: "Descripción de la sección",
				questions: []
			};

			return {
				survey: {
					...state.survey,
					sections: [...state.survey.sections, newSection]
				}
			};
		}),

	deleteSection: (id) =>
		set((state) => ({
			survey: {
				...state.survey,
				sections: state.survey.sections.filter(section => section.id !== id)
			}
		})),

	updateSectionTitle: (id, title) =>
		set((state) => ({
			survey: {
				...state.survey,
				sections: state.survey.sections.map(section =>
					section.id === id ? { ...section, title } : section
				)
			}
		})),

	updateSectionDescription: (id, description) =>
		set((state) => ({
			survey: {
				...state.survey,
				sections: state.survey.sections.map(section =>
					section.id === id ? { ...section, description } : section
				)
			}
		})),

	reorderSections: (orderedIds) =>
		set((state) => {
			const sectionMap = new Map(
				state.survey.sections.map(section => [section.id, section])
			);

			const reorderedSections = orderedIds
				.map(id => sectionMap.get(id))
				.filter((section): section is Section => section !== undefined);

			return {
				survey: {
					...state.survey,
					sections: reorderedSections
				}
			};
		}),

	// Question actions
	addQuestion: (sectionId, type) =>
		set((state) => {
			const defaultQuestion: Question = {
				id: generateId('question_'),
				type,
				label: `Nueva Pregunta ${type}`,
				...(type === 'select' || type === 'multiselect' || type === 'radio' || type === 'checkbox'
					? {
						options: [
							{ value: 'option1', label: 'Opción 1' },
							{ value: 'option2', label: 'Opción 2' }
						]
					}
					: {})
			};

			return {
				survey: {
					...state.survey,
					sections: state.survey.sections.map(section =>
						section.id === sectionId
							? { ...section, questions: [...section.questions, defaultQuestion] }
							: section
					)
				}
			};
		}),

	deleteQuestion: (sectionId, questionId) =>
		set((state) => ({
			survey: {
				...state.survey,
				sections: state.survey.sections.map(section =>
					section.id === sectionId
						? {
							...section,
							questions: section.questions.filter(q => q.id !== questionId)
						}
						: section
				)
			}
		})),

	updateQuestion: (sectionId, questionId, questionUpdates) =>
		set((state) => ({
			survey: {
				...state.survey,
				sections: state.survey.sections.map(section =>
					section.id === sectionId
						? {
							...section,
							questions: section.questions.map(question =>
								question.id === questionId
									? { ...question, ...questionUpdates }
									: question
							)
						}
						: section
				)
			}
		})),

	reorderQuestions: (sectionId, orderedIds) =>
		set((state) => {
			const section = state.survey.sections.find(s => s.id === sectionId);
			if (!section) return state;

			const questionMap = new Map(
				section.questions.map(question => [question.id, question])
			);

			const reorderedQuestions = orderedIds
				.map(id => questionMap.get(id))
				.filter((question): question is Question => question !== undefined);

			return {
				survey: {
					...state.survey,
					sections: state.survey.sections.map(s =>
						s.id === sectionId
							? { ...s, questions: reorderedQuestions }
							: s
					)
				}
			};
		}),
}));
