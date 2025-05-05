"use client";

import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { useSurveyStore } from "../../app/(super_admin)/projects/[id]/surveys/[survey_id]/edit/store";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog";

interface SectionSettingsDialogProps {
  sectionId: string | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionSettingsDialog({ sectionId, isOpen, onOpenChange }: SectionSettingsDialogProps) {
  const { survey, updateSectionTitle, updateSectionDescription, deleteSection } = useSurveyStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Get current section data when dialog opens
  useEffect(() => {
    if (isOpen && sectionId) {
      const section = survey.sections.find(s => s.id === sectionId);
      if (section) {
        setTitle(section.title);
        setDescription(section.description || "");
      }
    }
  }, [isOpen, sectionId, survey.sections]);

  const handleSave = () => {
    if (sectionId) {
      updateSectionTitle(sectionId, title);
      updateSectionDescription(sectionId, description);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (sectionId) {
      deleteSection(sectionId);
      setShowDeleteAlert(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de Sección</DialogTitle>
            <DialogDescription>
              Edita las propiedades de esta sección
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="section-title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="section-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la sección"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="section-description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="section-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la sección"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              type="button" 
              onClick={() => setShowDeleteAlert(true)}
            >
              Eliminar Sección
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la sección y todas sus preguntas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
