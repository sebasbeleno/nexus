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
}

// Hardcoded example survey object conforming to the schema
const exampleSurvey: SurveyStructure = {
	surveyId: "encuesta-vivienda-social-2025",
	title: "Encuesta de Vivienda Social 2025",
	description: "Encuesta para evaluar condiciones y necesidades de vivienda.",
	version: 1,
	sections: [
		{
			id: "sec_general_info",
			title: "Información General",
			description: "Detalles básicos sobre el hogar.",
			questions: [
				{
					id: "q_head_name",
					type: "text",
					label: "Nombre del jefe de hogar",
					placeholder: "Ingrese el nombre completo",
					validations: [
						{ type: "required", message: "Este campo es obligatorio" },
						{ type: "minLength", value: 5, message: "Debe tener al menos 5 caracteres" }
					]
				},
				{
					id: "q_num_residents",
					type: "number",
					label: "¿Cuántas personas viven en el hogar?",
					validations: [
						{ type: "required", message: "Campo obligatorio" },
						{ type: "minValue", value: 1, message: "Debe ser al menos 1" }
					]
				},
				{
					id: "q_household_income",
					type: "select",
					label: "Ingresos mensuales del hogar",
					options: [
						{ value: "range1", label: "Menos de $500.000" },
						{ value: "range2", label: "$500.000 - $1.000.000" },
						{ value: "range3", label: "$1.000.000 - $2.000.000" },
						{ value: "range4", label: "Más de $2.000.000" }
					],
					validations: [
						{ type: "required", message: "Por favor seleccione una opción" }
					]
				}
			]
		},
		{
			id: "sec_housing_conditions",
			title: "Condiciones de la Vivienda",
			description: "Información sobre la estructura física.",
			questions: [
				{
					id: "q_property_type",
					type: "select",
					label: "Tipo de vivienda",
					options: [
						{ value: "house", label: "Casa" },
						{ value: "apartment", label: "Apartamento" },
						{ value: "room", label: "Habitación" },
						{ value: "other", label: "Otro" }
					],
					validations: [
						{ type: "required", message: "Seleccione una opción" }
					]
				},
				{
					id: "q_construction_material",
					type: "radio",
					label: "Material principal de construcción",
					options: [
						{ value: "brick", label: "Ladrillo" },
						{ value: "concrete", label: "Concreto" },
						{ value: "wood", label: "Madera" },
						{ value: "prefab", label: "Prefabricado" },
						{ value: "other", label: "Otro" }
					],
					validations: [
						{ type: "required", message: "Por favor seleccione una opción" }
					]
				}
			]
		}
	]
};

// Helper function to generate a unique ID
function generateId(prefix: string = 'section_'): string {
	return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
	survey: exampleSurvey,
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
		}))
}));
