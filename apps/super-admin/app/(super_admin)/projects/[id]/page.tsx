"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, Edit, Loader2, Trash2 } from "lucide-react";

import type { Project } from "@workspace/types";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createClient } from "@/utils/supabase/client";

// Import the tab components
import { ProjectDetailsTab } from "./components/project-details-tab";
import { ProjectSettingsTab } from "./components/project-settings-tab";
import { SurveysTab } from "./components/project-surveys-tab";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id: ProjectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  const fetchProjectData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', ProjectId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Project not found')

      setProject(data)
      setEditedName(data.name)
      setEditedDescription(data.description || '')
    

    } catch (err: any) {
      console.error("Failed to fetch project:", err);
      setError(err.message || "No se pudieron cargar los detalles del proyecto."); // Translate error message
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [ProjectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleSave = async () => {
    if (!project) return;
    console.log("Saving project..."); // Keep console logs in English for developers
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProject((prev) => (prev ? { ...prev, name: editedName, description: editedDescription } : null));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      console.log("Deleting project..."); // Keep console logs in English for developers
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete project:", err); // Keep console logs in English
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Encontrado</AlertTitle> {/* Translate title */}
          <AlertDescription>No se pudo encontrar el proyecto.</AlertDescription> {/* Translate description */}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || "Sin descripción proporcionada."}</p> {/* Translate placeholder */}
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 size-4" /> Editar Proyecto {/* Translate button text */}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancelar {/* Translate button text */}
              </Button>
              <Button size="sm" onClick={handleSave}>
                Guardar Cambios {/* Translate button text */}
              </Button>
            </div>
          )}
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
            <Trash2 className="mr-2 size-4" /> Eliminar Proyecto {/* Translate button text */}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Edit Form (conditional) */}
      {isEditing && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="projectName">Nombre del Proyecto</Label> {/* Translate label */}
              <Input
                id="projectName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="projectDescription">Descripción</Label> {/* Translate label */}
              <Input
                id="projectDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Descripción del proyecto" // Translate placeholder
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Details, Settings, Surveys */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger> {/* Translate tab trigger */}
          <TabsTrigger value="surveys">Encuestas</TabsTrigger> {/* Translate tab trigger */}
          <TabsTrigger value="settings">Configuración</TabsTrigger> {/* Translate tab trigger */}
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {project && <ProjectDetailsTab project={project} />}
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <SurveysTab projectId={ProjectId} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          {project && (
            <ProjectSettingsTab
              project={project}
              onProjectUpdate={(updatedProject) => {
                setProject(updatedProject);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Project Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle> {/* Translate dialog title */}
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer. {/* Translate dialog description */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar {/* Translate button text */}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Eliminar Proyecto {/* Translate button text */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No CreateSurveyDialog here - moved to SurveysTab */}
    </div>
  );
}
