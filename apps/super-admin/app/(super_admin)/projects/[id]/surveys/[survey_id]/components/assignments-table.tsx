"use client";

import { useMemo, useState } from "react";
import { addDays, format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { 
  MoreHorizontalIcon,
  EyeIcon,
  PlayIcon,
  CheckIcon,
  XCircleIcon,
  RefreshCwIcon,
  FilterIcon,
  XIcon,
  CalendarIcon
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
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Assignment['status'] | "">("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  // Filtered assignments based on filter state
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesName = assignment.surveyor?.first_name.toLowerCase().includes(filter.toLowerCase()) || 
                          assignment.surveyor?.last_name.toLowerCase().includes(filter.toLowerCase()) ||
                          assignment.property?.name.toLowerCase().includes(filter.toLowerCase());

      const matchesStatus = statusFilter ? assignment.status === statusFilter : true;

      const matchesDateRange = dateRange?.from ? 
        (assignment.assigned_at && isValid(new Date(assignment.assigned_at))) &&
        new Date(assignment.assigned_at) >= dateRange.from && 
        (!dateRange.to || !assignment.due_date || new Date(assignment.due_date) <= dateRange.to)
        : true;

      return matchesName && matchesStatus && matchesDateRange;
    });
  }, [assignments, filter, statusFilter, dateRange]);

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Listado de Asignaciones</CardTitle>
        <CardDescription>
          Gestione las asignaciones de encuestas a encuestadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row items-center">
          <div className="flex-1">
            <div className="flex justify-between">
              <Label htmlFor="filter">Filtrar por nombre de encuestador o propiedad</Label>
              {filter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-xs px-2"
                  onClick={() => setFilter("")}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="relative">
              <Input 
                id="filter" 
                placeholder="Buscar..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8"
              />
              <div className="absolute left-2 top-2.5 text-muted-foreground">
                <FilterIcon className="h-4 w-4" />
              </div>
              {filter && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => setFilter("")}
                >
                  <XIcon className="h-3 w-3" />
                  <span className="sr-only">Limpiar filtro</span>
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <Label>Filtrar por estado</Label>
              {statusFilter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-xs px-2"
                  onClick={() => setStatusFilter("")}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as Assignment['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Asignada</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="in_review">En revisión</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <Label>Filtrar por fecha</Label>
              {dateRange && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-xs px-2"
                  onClick={() => setDateRange(undefined)}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccione un rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    locale={es}
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {(filter || statusFilter || dateRange) && (
          <div className="mb-2 text-sm text-muted-foreground">
            Mostrando {filteredAssignments.length} de {assignments.length} asignaciones
          </div>
        )}
        <DataTable
          columns={columns}
          data={filteredAssignments}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
