"use client";

import { useEffect, useState, useCallback, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Survey, Property, SurveyResponse } from "@workspace/types";
import { Separator } from "@workspace/ui/components/separator";
import { SurveyHeader } from "./components/survey-header";
import { SurveyTabs } from "./components/survey-tabs";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";

export default function SurveyPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id } = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch survey data
  const fetchSurveyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', survey_id)
        .single();

      if (surveyError) throw surveyError;
      if (!surveyData) throw new Error('Encuesta no encontrada');

      setSurvey(surveyData);

      // Fetch properties associated with the project
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('project_id', projectId);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch survey responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('assignment_id', survey_id);

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

    } catch (err: any) {
      console.error("Failed to fetch survey data:", err);
      setError(err.message || "No se pudieron cargar los detalles de la encuesta.");
      setSurvey(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, survey_id, supabase]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!survey) {
    return <ErrorState message="No se pudo encontrar la encuesta solicitada." isNotFound />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SurveyHeader survey={survey} projectId={projectId} />
      <Separator />
      <SurveyTabs survey={survey} properties={properties} responses={responses} projectId={projectId} />
    </div>
  );
}
