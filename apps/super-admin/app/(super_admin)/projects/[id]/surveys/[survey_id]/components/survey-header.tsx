"use client";

import { Survey } from "@workspace/types";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowLeft, Clipboard, ClipboardCheck } from "lucide-react";
import { useState } from "react";

interface SurveyHeaderProps {
  survey: Survey;
  projectId: string;
}

export function SurveyHeader({ survey, projectId }: SurveyHeaderProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyId = () => {
    if (survey) {
      navigator.clipboard.writeText(survey.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/projects/${projectId}`}>
        <Button variant="outline" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 w-4 h-4" /> Volver al Proyecto
        </Button>
      </Link>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{survey.name}</h1>
          <p className="text-muted-foreground">{survey.description || "Sin descripción"}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Versión: {survey.version}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="flex items-center gap-1"
          >
            {copySuccess ? (
              <>
                <ClipboardCheck className="w-4 h-4" /> Copiado
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" /> Copiar ID
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
