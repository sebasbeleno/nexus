"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Eye, Pencil, Save, Settings } from "lucide-react";
import { SectionList } from "@/components/survey-builder/section-list";
import { QuestionTypeCard } from "@/components/survey-builder/question-type-card";
import { SectionEditor } from "@/components/survey-builder/section-editor";
import { SectionSettingsDialog } from "@/components/survey-builder/section-settings-dialog";
import { SurveyPreviewContainer } from "@/components/survey-builder/survey-preview-container";
import { useSurveyStore } from "./store";
import { QuestionType, SurveyStructure } from "@workspace/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditSurveyPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id } = use(params);
  const router = useRouter();
  const { survey, setSurvey, addQuestion } = useSurveyStore();
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined);
  const [isSectionSettingsOpen, setIsSectionSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const supabase = createClient();

  // Load survey data from Supabase
  useEffect(() => {
    async function loadSurveyData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data: surveyData, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', survey_id)
          .single();
        
        if (error) {
          throw new Error(`Error al cargar la encuesta: ${error.message}`);
        }
        
        if (!surveyData) {
          throw new Error(`No se encontró la encuesta con ID: ${survey_id}`);
        }
        
        console.log("Datos cargados de Supabase:", surveyData);
        
        // Crear una estructura de encuesta válida
        let surveyStructure: SurveyStructure;
        
        // Si existe estructura y parece tener formato válido
        if (
          surveyData.structure && 
          typeof surveyData.structure === 'object' &&
          Object.keys(surveyData.structure).length > 0 &&
          (
            Array.isArray(surveyData.structure.sections) || 
            typeof surveyData.structure.title === 'string'
          )
        ) {
          // Asegurarse de que tiene todos los campos necesarios
          surveyStructure = {
            surveyId: surveyData.id,
            title: surveyData.structure.title || surveyData.name || "Sin título",
            description: surveyData.structure.description || surveyData.description || "",
            version: surveyData.structure.version || surveyData.version || 1,
            sections: Array.isArray(surveyData.structure.sections) 
              ? surveyData.structure.sections 
              : []
          };
        } else {
          // Inicializar con una estructura vacía pero con el ID y datos correctos
          surveyStructure = {
            surveyId: surveyData.id,
            title: surveyData.name || "Sin título",
            description: surveyData.description || "",
            version: surveyData.version || 1,
            sections: []
          };
        }
        
        console.log("Estructura procesada para el store:", surveyStructure);
        setSurvey(surveyStructure);
      } catch (err: any) {
        console.error("Failed to load survey:", err);
        setLoadError(err.message || "Error al cargar la encuesta");
        toast.error(err.message || "Error al cargar la encuesta");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSurveyData();
  }, [survey_id, setSurvey, supabase]);

  // Set first section as selected when survey loads or changes
  useEffect(() => {
    if (!isLoading && survey.sections && survey.sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(survey.sections[0]?.id);
    }
  }, [survey.sections, selectedSectionId, isLoading]);

  const handleQuestionTypeSelect = (type: QuestionType) => {
    if (selectedSectionId) {
      addQuestion(selectedSectionId, type);
    } else {
      toast.error("Por favor, selecciona una sección primero.");
    }
  };

  const handleSectionSettings = (sectionId: string) => {
    if (sectionId) {
      setSelectedSectionId(sectionId);
      setIsSectionSettingsOpen(true);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Asegurémonos de que la estructura tiene el id correcto antes de guardar
      const surveyToSave = {
        ...survey,
        surveyId: survey_id // Asegurar que el surveyId siempre sea el correcto
      };
      
      console.log("Guardando estructura:", surveyToSave);
      
      const { error } = await supabase
        .from('surveys')
        .update({
          structure: surveyToSave,
          name: surveyToSave.title, // Sincronizamos el título con la estructura
          description: surveyToSave.description, // Sincronizamos la descripción con la estructura
          updated_at: new Date().toISOString()
        })
        .eq('id', survey_id);

      if (error) throw error;
      
      toast.success("Encuesta guardada correctamente");
      
      // Actualizar el store con la estructura guardada para asegurar consistencia
      setSurvey(surveyToSave);
    } catch (error: any) {
      console.error("Failed to save survey:", error);
      toast.error("Error al guardar la encuesta: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/surveys/${survey_id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la Encuesta
              </Button>
            </Link>
            <Button
              variant={isPreviewMode ? "outline" : "secondary"}
              size="sm"
              onClick={handleTogglePreviewMode}
              disabled={isLoading || survey.sections.length === 0}
            >
              {isPreviewMode ? (
                <>
                  <Pencil className="mr-2 w-4 h-4" /> Modo Edición
                </>
              ) : (
                <>
                  <Eye className="mr-2 w-4 h-4" /> Vista Previa
                </>
              )}
            </Button>
          </div>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving || isLoading || isPreviewMode}
          >
            <Save className="mr-2 w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{survey.title || "Cargando..."}</h1>
          {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando estructura de la encuesta...</p>
          </div>
        </div>
      )}
      
      {!isLoading && loadError && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center p-6 bg-destructive/10 rounded-lg max-w-md">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Error al cargar la encuesta</h3>
            <p className="text-muted-foreground mb-4">{loadError}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/projects/${projectId}/surveys`)}
            >
              Volver a la lista de encuestas
            </Button>
          </div>
        </div>
      )}
      
      {!isLoading && !loadError && (
        <>
          {isPreviewMode ? (
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                <SurveyPreviewContainer 
                  survey={survey} 
                  onClose={handleTogglePreviewMode} 
                />
              </div>
            </div>
          ) : (
            /* Main Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Section List */}
              <div className="col-span-1">
                <SectionList
                  onSelectSection={setSelectedSectionId}
                  selectedSectionId={selectedSectionId}
                  onSectionSettings={handleSectionSettings}
                />
              </div>
              
              {/* Main Content Area */}
              <div className="col-span-1 md:col-span-2">
                {selectedSectionId ? (
                  <SectionEditor sectionId={selectedSectionId} />
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Seleccione una sección para editar o cree una nueva</p>
                      <Button onClick={() => addQuestion(selectedSectionId!, 'text')} disabled={!selectedSectionId}>
                        Añadir Pregunta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Sidebar - Question Types */}
              <div className="col-span-1">
                <QuestionTypeCard onSelect={handleQuestionTypeSelect} />
              </div>
            </div>
          )}
        </>
      )}

      <SectionSettingsDialog
        sectionId={selectedSectionId}
        isOpen={isSectionSettingsOpen}
        onOpenChange={setIsSectionSettingsOpen}
      />
    </div>
  );
}
