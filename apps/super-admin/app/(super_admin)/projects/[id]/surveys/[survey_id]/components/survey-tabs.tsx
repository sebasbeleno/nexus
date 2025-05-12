"use client";

import { Survey, Property, SurveyResponse } from "@workspace/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { OverviewTab } from "./overview-tab";
import { StructureTab } from "./structure-tab";
import { PropertiesTab } from "./properties-tab";
import { ResponsesTab } from "./responses-tab";
import { AssignmentsTab } from "./assignments-tab";

interface SurveyTabsProps {
  survey: Survey;
  properties: Property[];
  responses: SurveyResponse[];
  projectId: string;
}

export function SurveyTabs({ survey, properties, responses, projectId }: SurveyTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="structure">Estructura</TabsTrigger>
        <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
        <TabsTrigger value="properties">Propiedades</TabsTrigger>
        <TabsTrigger value="responses">Respuestas</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <OverviewTab survey={survey} properties={properties} responses={responses} />
      </TabsContent>

      {/* Structure Tab */}
      <TabsContent value="structure">
        <StructureTab survey={survey} projectId={projectId} />
      </TabsContent>

      {/* Assignments Tab */}
      <TabsContent value="assignments">
        <AssignmentsTab survey={survey} properties={properties} projectId={projectId} />
      </TabsContent>

      {/* Properties Tab */}
      <TabsContent value="properties">
        <PropertiesTab properties={properties} />
      </TabsContent>

      {/* Responses Tab */}
      <TabsContent value="responses">
        <ResponsesTab responses={responses} />
      </TabsContent>
    </Tabs>
  );
}
