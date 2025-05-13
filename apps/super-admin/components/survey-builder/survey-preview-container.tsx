"use client";

import { useState } from "react";
import { SurveyStructure } from "@workspace/types";
import { SurveyPreview } from "./survey-preview-fixed";
import { ResponseSummary } from "./response-summary";

interface SurveyPreviewContainerProps {
  survey: SurveyStructure;
  onClose: () => void;
}

export function SurveyPreviewContainer({ survey, onClose }: SurveyPreviewContainerProps) {
  const [isPreviewComplete, setIsPreviewComplete] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  const handlePreviewComplete = (responses: Record<string, any>) => {
    setPreviewResponses(responses);
    setIsPreviewComplete(true);
  };

  const handleBackToPreview = () => {
    setIsPreviewComplete(false);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {!isPreviewComplete ? (
        <SurveyPreview 
          sections={survey.sections} 
          onComplete={handlePreviewComplete}
        />
      ) : (
        <ResponseSummary 
          survey={survey}
          responses={previewResponses}
          onBack={handleBackToPreview}
        />
      )}
    </div>
  );
}
