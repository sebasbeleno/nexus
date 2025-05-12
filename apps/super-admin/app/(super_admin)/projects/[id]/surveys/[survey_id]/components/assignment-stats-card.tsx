"use client";

import { useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@workspace/ui/components/card";
import { Assignment } from "./assignments-table";

interface AssignmentStatsCardProps {
  assignments: Assignment[];
}

export function AssignmentStatsCard({ assignments }: AssignmentStatsCardProps) {
  // Calculate statistics for assignments
  const stats = useMemo(() => {
    return {
      total: assignments.length,
      pending: assignments.filter(a => a.status === 'assigned').length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      overdue: assignments.filter(a => a.status === 'overdue').length,
      cancelled: assignments.filter(a => a.status === 'cancelled').length
    };
  }, [assignments]);
  
  return (
    <Card className="md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Estadísticas de Asignaciones</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pendientes:</span>
            <span className="font-medium">{stats.pending}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">En progreso:</span>
            <span className="font-medium">{stats.inProgress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completadas:</span>
            <span className="font-medium">{stats.completed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vencidas:</span>
            <span className="font-medium">{stats.overdue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Canceladas:</span>
            <span className="font-medium">{stats.cancelled}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
