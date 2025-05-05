"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { SectionList } from "@/components/survey-builder/section-list";
import { QuestionTypeCard } from "@/components/survey-builder/question-type-card";
import { SectionEditor } from "@/components/survey-builder/section-editor";
import { SectionSettingsDialog } from "@/components/survey-builder/section-settings-dialog";
import { useSurveyStore } from "./store";
import { QuestionType } from "@workspace/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditSurveyPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id } = use(params);
  const router = useRouter();
  const { survey, addQuestion } = useSurveyStore();
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(
    survey.sections && survey.sections.length > 0 ? survey.sections[0]?.id : undefined
  );
  const [isSectionSettingsOpen, setIsSectionSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // Set first section as selected when survey changes
  useEffect(() => {
    if (survey.sections && survey.sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(survey.sections[0]?.id);
    }
  }, [survey.sections, selectedSectionId]);

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
      const { error } = await supabase
        .from('surveys')
        .update({
          structure: survey,
          updated_at: new Date().toISOString()
        })
        .eq('id', survey_id);

      if (error) throw error;
      
      toast.success("Encuesta guardada correctamente");
    } catch (error: any) {
      console.error("Failed to save survey:", error);
      toast.error("Error al guardar la encuesta: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href={`/projects/${projectId}/surveys/${survey_id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la Encuesta
            </Button>
          </Link>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            <Save className="mr-2 w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{survey.title}</h1>
          {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <SectionList 
            onSelectSection={setSelectedSectionId}
            selectedSectionId={selectedSectionId}
            onSectionSettings={handleSectionSettings}
          />
          <QuestionTypeCard onSelect={handleQuestionTypeSelect} />
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-2 lg:col-span-3">
          <SectionEditor sectionId={selectedSectionId} />
        </div>
      </div>

      {/* Section Settings Dialog */}
      <SectionSettingsDialog
        sectionId={selectedSectionId}
        isOpen={isSectionSettingsOpen}
        onOpenChange={setIsSectionSettingsOpen}
      />
    </div>
  );
}
