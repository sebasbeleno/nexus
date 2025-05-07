"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Save } from "lucide-react";
import type { Project, ProjectStatus } from "@workspace/types";
import { Calendar } from "@workspace/ui/components/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { createClient } from "@/utils/supabase/client";

interface ProjectSettingsTabProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export function ProjectSettingsTab({ project, onProjectUpdate }: ProjectSettingsTabProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? new Date(project.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.end_date ? new Date(project.end_date) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClient();

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = {
        name,
        description: description || null,
        status,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", project.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        onProjectUpdate(data as Project);
      }
    } catch (error) {
      console.error("Failed to update project settings:", error);
      // Here you could add a toast notification for error feedback
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Proyecto</CardTitle>
        <CardDescription>Configura los ajustes y permisos del proyecto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Project Details */}
        <div className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="project-name">Nombre del Proyecto</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del proyecto"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="project-description">Descripción</Label>
            <Input
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del proyecto"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="project-status">Estado del Proyecto</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
              <SelectTrigger id="project-status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fechas del Proyecto</h3>
          
          <div className="grid gap-3">
            <Label htmlFor="start-date">Fecha de Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="end-date">Fecha de Finalización</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => 
                    startDate ? date < startDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveChanges} disabled={isSaving}>
          {isSaving ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
