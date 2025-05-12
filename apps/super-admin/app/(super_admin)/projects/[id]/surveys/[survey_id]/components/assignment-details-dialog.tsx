"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

interface AssignmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    id: string;
    survey_id: string;
    surveyor_user_id: string;
    property_id: string | null;
    survey_version: number;
    due_date: string | null;
    assigned_at: string;
    cancelled_at: string | null;
    status: string;
    surveyor: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
    property: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export function AssignmentDetailsDialog({
  open,
  onOpenChange,
  assignment,
}: AssignmentDetailsDialogProps) {
  if (!assignment) return null;

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "outline" | "secondary" | "destructive" }> = {
      assigned: { label: "Asignada", variant: "outline" },
      in_progress: { label: "En progreso", variant: "secondary" },
      in_review: { label: "En revisión", variant: "secondary" },
      approved: { label: "Aprobada", variant: "secondary" },
      rejected: { label: "Rechazada", variant: "destructive" },
      cancelled: { label: "Cancelada", variant: "destructive" },
      completed: { label: "Completada", variant: "secondary" },
      overdue: { label: "Vencida", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles de la Asignación</DialogTitle>
          <DialogDescription>
            Información detallada sobre la asignación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <span>{getStatusBadge(assignment.status)}</span>
          </div>
          <Separator />
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Encuestador:</span>
              <span className="text-sm">
                {assignment.surveyor 
                  ? `${assignment.surveyor.first_name} ${assignment.surveyor.last_name}`
                  : "N/A"}
              </span>
            </div>
            
            {assignment.surveyor && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{assignment.surveyor.email}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Propiedad:</span>
              <span className="text-sm">
                {assignment.property ? assignment.property.name : "Sin propiedad específica"}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Versión de encuesta:</span>
              <span className="text-sm">{assignment.survey_version}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha de asignación:</span>
              <span className="text-sm">
                {format(new Date(assignment.assigned_at), "PPP", { locale: es })}
              </span>
            </div>
            
            {assignment.due_date && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fecha límite:</span>
                <span className="text-sm">
                  {format(new Date(assignment.due_date), "PPP", { locale: es })}
                </span>
              </div>
            )}
            
            {assignment.cancelled_at && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fecha de cancelación:</span>
                <span className="text-sm">
                  {format(new Date(assignment.cancelled_at), "PPP", { locale: es })}
                </span>
              </div>
            )}
          </div>

          <Separator />
          <div className="flex justify-between">
            <span className="text-sm font-medium">ID de asignación:</span>
            <span className="text-sm text-muted-foreground">{assignment.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
