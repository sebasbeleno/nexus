"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { PlusCircle, Settings } from "lucide-react";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { Section } from "@workspace/types";
import { cn } from "@workspace/ui/lib/utils";

interface SectionListProps {
  onSelectSection: (sectionId: string) => void;
  selectedSectionId?: string;
  onSectionSettings: (sectionId: string) => void;
}

export function SectionList({ onSelectSection, selectedSectionId, onSectionSettings }: SectionListProps) {
  const { survey, addSection } = useSurveyStore();
  
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Secciones</CardTitle>
        <Button onClick={addSection} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Añadir
        </Button>
      </CardHeader>
      <CardContent>
        {survey.sections.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground text-sm">No hay secciones. Haga clic en "Añadir" para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {survey.sections.map((section) => (
              <div 
                key={section.id}
                className={cn(
                  "p-3 rounded-md border flex justify-between items-center cursor-pointer",
                  selectedSectionId === section.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                )}
                onClick={() => onSelectSection(section.id)}
              >
                <div>
                  <p className="font-medium text-sm">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.questions.length} preguntas</p>
                </div>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSectionSettings(section.id);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
