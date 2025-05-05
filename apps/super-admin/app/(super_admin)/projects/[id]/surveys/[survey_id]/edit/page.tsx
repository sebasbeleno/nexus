"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { SurveyBuilder } from "@/components/survey-builder/survey-builder";

export default function EditSurveyPage({ params }: { params: Promise<{ id: string; survey_id: string }> }) {
  const { id: projectId, survey_id } = use(params);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <Link href={`/projects/${projectId}/surveys/${survey_id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la Encuesta
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editor de Encuesta</h1>
          <Button variant="outline" size="sm">
            Vista Previa
          </Button>
        </div>
      </div>

      <SurveyBuilder />
    </div>
  );
}
