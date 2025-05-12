"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@workspace/ui/components/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@workspace/ui/components/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { 
  ColumnDef, 
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CalendarIcon, 
  PlusCircle, 
  AlertCircle,
  MoreHorizontalIcon,
  EyeIcon,
  PlayIcon,
  CheckIcon,
  XCircleIcon,
  RefreshCwIcon
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DataTable } from "@/components/data-table";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "sonner";
import { 
  assignSurvey, 
  getAssignmentsBySurvey, 
  updateAssignmentStatus 
} from "@workspace/db/src/queries/surveys";
import { getProfilesByRole } from "@workspace/db/src/queries/profiles";
import { AssignmentDetailsDialog } from "./assignment-details-dialog";

// Types
interface AssignmentsTabProps {
  survey: {
    id: string;
    name?: string;
    version: number;
    [key: string]: any;
  };
  properties: Array<{
    id: string;
    name?: string;
    [key: string]: any;
  }>;
  projectId: string;
}

// Define interfaces for data
interface PropertyDisplay {
  id: string;
  name: string;
}

type Surveyor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type Assignment = {
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

// Validation schema for assignment form
const assignmentSchema = z.object({
  surveyorId: z.string({
    required_error: "Por favor seleccione un encuestador",
  }),
  propertyId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export function AssignmentsTab({ survey, properties, projectId }: AssignmentsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const supabase = createClient();
  
  // Handle viewing assignment details
  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDetailsDialogOpen(true);
  };
  
  // Handle assignment status change
  const handleStatusChange = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      // Map frontend status to database status if needed
      // The database currently only supports: assigned, in_progress, in_review, approved, rejected, cancelled
      let dbStatus: 'assigned' | 'in_progress' | 'in_review' | 'approved' | 'rejected' | 'cancelled';
      
      if (newStatus === 'completed' || newStatus === 'overdue') {
        // Map to existing status as a workaround until the database schema is updated
        dbStatus = 'in_review';
        console.warn(`Status '${newStatus}' is not yet supported in the database schema. Using 'in_review' as temporary mapping.`);
      } else {
        dbStatus = newStatus as typeof dbStatus;
      }
      
      // Update in the database with the compatible status
      const { data, error } = await updateAssignmentStatus(
        supabase,
        assignmentId,
        dbStatus
      );
      
      if (error) throw error;
      
      const statusLabels: Record<Assignment['status'], string> = {
        assigned: "Asignada",
        in_progress: "En progreso",
        in_review: "En revisión",
        approved: "Aprobada",
        rejected: "Rechazada",
        cancelled: "Cancelada",
        completed: "Completada",
        overdue: "Vencida"
      };
      
      toast.success(`Estado actualizado correctamente`, {
        description: `La asignación ha sido marcada como: ${statusLabels[newStatus]}`
      });
      
      // Update assignment in the local state with the frontend status
      setAssignments(assignments.map(assignment => {
        if (assignment.id === assignmentId) {
          const updatedAssignment = { 
            ...assignment, 
            status: newStatus 
          };
          
          // Add cancelled_at timestamp if status is cancelled
          if (newStatus === 'cancelled') {
            updatedAssignment.cancelled_at = new Date().toISOString();
          }
          
          return updatedAssignment;
        }
        return assignment;
      }));
    } catch (err: any) {
      console.error(`Error updating assignment status to ${newStatus}:`, err);
      toast.error("Error al actualizar el estado", {
        description: err.message || `Ocurrió un error al actualizar el estado de la asignación`
      });
    }
  };
  
  // Handle assignment cancellation
  const handleCancelAssignment = async (assignmentId: string) => {
    await handleStatusChange(assignmentId, 'cancelled');
  };

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

  // Form setup
  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      surveyorId: "",
      propertyId: null,
      dueDate: null,
    },
  });

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
              <DropdownMenuItem onClick={() => handleViewDetails(assignment)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              
              {assignment.status === 'assigned' && (
                <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, 'in_progress')}>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Marcar en progreso
                </DropdownMenuItem>
              )}
              
              {(assignment.status === 'assigned' || assignment.status === 'in_progress') && (
                <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, 'completed')}>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Marcar como completada
                </DropdownMenuItem>
              )}
              
              {(['assigned', 'in_progress', 'overdue'].includes(assignment.status)) && (
                <DropdownMenuItem 
                  onClick={() => handleStatusChange(assignment.id, 'cancelled')}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  Cancelar asignación
                </DropdownMenuItem>
              )}
              
              {(['cancelled', 'completed'].includes(assignment.status)) && (
                <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, 'assigned')}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Reactivar asignación
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  // Fetch assignments and surveyors
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await getAssignmentsBySurvey(
          supabase,
          survey.id
        );

        if (assignmentsError) throw assignmentsError;

        // Fetch surveyors
        const { data: surveyorsData, error: surveyorsError } = await getProfilesByRole(
          supabase,
          'surveyor'
        );

        if (surveyorsError) throw surveyorsError;
        
        // Map surveyors and properties to assignments
        const enhancedAssignments: Assignment[] = (assignmentsData || []).map((assignment) => {
          // Find surveyor data
          const surveyorData = surveyorsData?.find(s => s.id === assignment.surveyor_user_id) || null;
          
          // Create surveyor object with required fields
          const surveyor = surveyorData ? {
            id: surveyorData.id,
            first_name: surveyorData.first_name,
            last_name: surveyorData.last_name,
            email: surveyorData.email
          } : null;
          
          // Find property data and convert to PropertyDisplay
          let propertyDisplay = null;
          if (assignment.property_id) {
            const foundProperty = properties.find(p => p.id === assignment.property_id);
            if (foundProperty) {
              propertyDisplay = {
                id: foundProperty.id,
                name: foundProperty.name || `Propiedad ${foundProperty.id}`, // Fallback if name is missing
              };
            }
          }
          
          return {
            id: assignment.id,
            survey_id: assignment.survey_id,
            surveyor_user_id: assignment.surveyor_user_id,
            property_id: assignment.property_id,
            survey_version: assignment.survey_version,
            due_date: assignment.due_date,
            assigned_at: assignment.assigned_at,
            cancelled_at: assignment.cancelled_at || null,
            status: assignment.status,
            surveyor,
            property: propertyDisplay
          } as Assignment;
        });
        
        // Create proper surveyor objects
        const mappedSurveyors = surveyorsData?.map(s => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email
        })) || [];
        
        setAssignments(enhancedAssignments);
        setSurveyors(mappedSurveyors);
      } catch (err: any) {
        console.error("Error fetching assignments data:", err);
        toast.error("Error al cargar las asignaciones", {
          description: err.message || "Ocurrió un error al cargar los datos",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [survey.id, properties, supabase]);
  
  // Handle assignment creation
  const onSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    try {
      // Handle the special case for "no_property" value
      const propertyId = values.propertyId === "no_property" ? null : values.propertyId;
      
      const assignmentData = {
        survey_id: survey.id,
        surveyor_user_id: values.surveyorId,
        property_id: propertyId,
        due_date: values.dueDate ? values.dueDate.toISOString() : null,
        survey_version: survey.version,
        status: 'assigned' as const,
      };
      
      const { data, error } = await assignSurvey(supabase, assignmentData);
      
      if (error) throw error;
      
      // Find the surveyor data to display in the toast
      const surveyor = surveyors.find(s => s.id === values.surveyorId);
      
      toast.success("Encuesta asignada correctamente", {
        description: `Asignada a ${surveyor?.first_name} ${surveyor?.last_name}`,
      });
      
      // Refresh assignments list
      const { data: assignmentsData } = await getAssignmentsBySurvey(supabase, survey.id);
      
      if (assignmentsData) {
        // Map surveyors and properties to assignments using the same mapping as in fetchData
        const enhancedAssignments: Assignment[] = assignmentsData.map((assignment) => {
          // Find surveyor data
          const surveyorData = surveyors.find(s => s.id === assignment.surveyor_user_id) || null;
          
          // Find property data
          let propertyDisplay = null;
          if (assignment.property_id) {
            const foundProperty = properties.find(p => p.id === assignment.property_id);
            if (foundProperty) {
              propertyDisplay = {
                id: foundProperty.id,
                name: foundProperty.name || `Propiedad ${foundProperty.id}`,
              };
            }
          }
          
          return {
            id: assignment.id,
            survey_id: assignment.survey_id,
            surveyor_user_id: assignment.surveyor_user_id,
            property_id: assignment.property_id,
            survey_version: assignment.survey_version,
            due_date: assignment.due_date,
            assigned_at: assignment.assigned_at,
            cancelled_at: assignment.cancelled_at || null,
            status: assignment.status,
            surveyor: surveyorData,
            property: propertyDisplay
          } as Assignment;
        });
        
        setAssignments(enhancedAssignments);
      }
      
      // Reset form and close dialog
      form.reset();
      setOpenDialog(false);
    } catch (err: any) {
      console.error("Error assigning survey:", err);
      toast.error("Error al asignar la encuesta", {
        description: err.message || "Ocurrió un error durante la asignación",
      });
    }
  };
  
  // Calculate statistics for assignments
  const assignmentStats = useMemo(() => {
    const stats = {
      total: assignments.length,
      pending: assignments.filter(a => a.status === 'assigned').length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      overdue: assignments.filter(a => a.status === 'overdue').length,
      cancelled: assignments.filter(a => a.status === 'cancelled').length
    };
    return stats;
  }, [assignments]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Asignaciones</h2>
      </div>
      
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Asignación
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Encuesta</DialogTitle>
              <DialogDescription>
                Asigne la encuesta "{survey.name || survey.id}" a un encuestador.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="surveyorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encuestador</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar encuestador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {surveyors.length > 0 ? (
                            surveyors.map((surveyor) => (
                              <SelectItem key={surveyor.id} value={surveyor.id}>
                                {surveyor.first_name} {surveyor.last_name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No hay encuestadores disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        El encuestador que realizará la encuesta
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propiedad (Opcional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar propiedad (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_property">Sin propiedad específica</SelectItem>
                          {properties.length > 0 ? (
                            properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name || `Propiedad ${property.id}`}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No hay propiedades disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Relaciona la asignación con una propiedad específica (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha límite (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Fecha límite para completar la encuesta (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <p>La encuesta se asignará con la versión actual ({survey.version})</p>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Asignar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Assignments stats card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Estadísticas de Asignaciones</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{assignmentStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendientes:</span>
                <span className="font-medium">{assignmentStats.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">En progreso:</span>
                <span className="font-medium">{assignmentStats.inProgress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completadas:</span>
                <span className="font-medium">{assignmentStats.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vencidas:</span>
                <span className="font-medium">{assignmentStats.overdue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Canceladas:</span>
                <span className="font-medium">{assignmentStats.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignments table */}
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
      </div>
      
      {/* Assignment details dialog */}
      <AssignmentDetailsDialog 
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        assignment={selectedAssignment}
      />
    </div>
  );
}
