"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { 
  MoreHorizontalIcon,
  EyeIcon,
  PlayIcon,
  CheckIcon,
  XCircleIcon,
  RefreshCwIcon
} from "lucide-react";

// Types
type PropertyDisplay = {
  id: string;
  name: string;
};

type Surveyor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type Assignment = {
  id: string;
  survey_id: string;
  surveyor_user_id: string;
  property_id: string | null;
  survey_version: number;
  due_date: string | null;
  assigned_at: string;
  cancelled_at: string | null;
  status: 'assigned' | 'in_progress' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'overdue';
  surveyor: Surveyor | null;
  property: PropertyDisplay | null;
};

interface AssignmentsTableProps {
  assignments: Assignment[];
  isLoading: boolean;
  onViewDetails: (assignment: Assignment) => void;
  onStatusChange: (assignmentId: string, newStatus: Assignment['status']) => Promise<void>;
}

// Status badge component for displaying assignment status
function StatusBadge({ status }: { status: Assignment['status'] }) {
  const statusConfig = {
    assigned: { label: "Asignada", variant: "outline" as const },
    in_progress: { label: "En progreso", variant: "secondary" as const },
    in_review: { label: "En revisión", variant: "secondary" as const },
    approved: { label: "Aprobada", variant: "secondary" as const },
    rejected: { label: "Rechazada", variant: "destructive" as const },
    cancelled: { label: "Cancelada", variant: "destructive" as const },
    completed: { label: "Completada", variant: "secondary" as const },
    overdue: { label: "Vencida", variant: "destructive" as const },
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>{config.label}</Badge>
  );
}

export function AssignmentsTable({ 
  assignments, 
  isLoading, 
  onViewDetails, 
  onStatusChange 
}: AssignmentsTableProps) {
  // Columns for assignments data table
  const columns: ColumnDef<Assignment>[] = useMemo(() => [
    {
      accessorKey: "surveyor",
      header: "Encuestador",
      cell: ({ row }) => {
        const surveyor = row.original.surveyor;
        return surveyor ? `${surveyor.first_name} ${surveyor.last_name}` : "N/A";
      },
    },
    {
      accessorKey: "property",
      header: "Propiedad",
      cell: ({ row }) => {
        const property = row.original.property;
        return property ? property.name : "N/A";
      },
    },
    {
      accessorKey: "survey_version",
      header: "Versión",
      cell: ({ row }) => row.getValue("survey_version"),
    },
    {
      accessorKey: "assigned_at",
      header: "Fecha de asignación",
      cell: ({ row }) => {
        const date = row.original.assigned_at;
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A";
      },
    },
    {
      accessorKey: "due_date",
      header: "Fecha límite",
      cell: ({ row }) => {
        const date = row.original.due_date;
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const assignment = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onViewDetails(assignment)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              
              {assignment.status === 'assigned' && (
                <DropdownMenuItem onClick={() => onStatusChange(assignment.id, 'in_progress')}>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Marcar en progreso
                </DropdownMenuItem>
              )}
              
              {(assignment.status === 'assigned' || assignment.status === 'in_progress') && (
                <DropdownMenuItem onClick={() => onStatusChange(assignment.id, 'completed')}>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Marcar como completada
                </DropdownMenuItem>
              )}
              
              {(['assigned', 'in_progress', 'overdue'].includes(assignment.status)) && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange(assignment.id, 'cancelled')}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  Cancelar asignación
                </DropdownMenuItem>
              )}
              
              {(['cancelled', 'completed'].includes(assignment.status)) && (
                <DropdownMenuItem onClick={() => onStatusChange(assignment.id, 'assigned')}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Reactivar asignación
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [onViewDetails, onStatusChange]);

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Listado de Asignaciones</CardTitle>
        <CardDescription>
          Gestione las asignaciones de encuestas a encuestadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={assignments}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
