"use client";

import { useEffect, useState, useCallback, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Survey, Property, SurveyResponse } from "@workspace/types";
import { Separator } from "@workspace/ui/components/separator";
import { SurveyHeader } from "./components/survey-header";
import { SurveyTabs } from "./components/survey-tabs";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import {
  getSurveyById,
  getResponsesBySurvey,
} from "@workspace/db/src/queries/surveys";

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
      // Fetch survey details using the query function from db package
      const { data: surveyData, error: surveyError } = await getSurveyById(
        supabase,
        survey_id
      );

      if (surveyError) throw surveyError;
      if (!surveyData) throw new Error('Encuesta no encontrada');

      // Map database survey data to Survey type
      setSurvey({
        id: surveyData.id,
        title: surveyData.name,
        description: surveyData.description || "",
        version: surveyData.version,
        structure: surveyData.structure as Record<string, any>,
        created_at: surveyData.created_at,
        updated_at: surveyData.updated_at,
        project_id: surveyData.project_id,
        deadline: surveyData.deadline,
        metadata: surveyData.metadata as Record<string, any>,
      } as unknown as Survey);

      // Fetch properties associated with the project
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('project_id', projectId);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch survey responses
      const { data: responsesData, error: responsesError } = await getResponsesBySurvey(
        supabase,
        survey_id
      );

      if (responsesError) throw responsesError;
      
      // Map database response data to SurveyResponse type
      const mappedResponses = (responsesData || []).map(item => ({
        id: item.id,
        assignment_id: item.assignment_id,
        submitted_at: item.submitted_at,
        location_submitted: item.location_submitted,
        surveyor_notes: item.surveyor_notes || "",
        responses: item.responses as Record<string, any>,
        metadata: item.metadata as Record<string, any>,
        assignment: item.assignment,
      } as SurveyResponse));
      
      setResponses(mappedResponses);

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
