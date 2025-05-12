"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { 
  assignSurvey, 
  getAssignmentsBySurvey, 
  updateAssignmentStatus 
} from "@workspace/db/src/queries/surveys";
import { getProfilesByRole } from "@workspace/db/src/queries/profiles";

// Components
import { AssignmentsTable, Assignment } from "./assignments-table";
import { AssignmentStatsCard } from "./assignment-stats-card";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
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

type Surveyor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
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
  const handleCreateAssignment = async (values: z.infer<typeof assignmentSchema>) => {
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
      
      setOpenDialog(false);
    } catch (err: any) {
      console.error("Error assigning survey:", err);
      toast.error("Error al asignar la encuesta", {
        description: err.message || "Ocurrió un error durante la asignación",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Asignaciones</h2>
      </div>
      
      <div className="flex justify-end">
        <CreateAssignmentDialog
          survey={survey}
          properties={properties}
          surveyors={surveyors}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onSubmit={handleCreateAssignment}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Assignments stats card */}
        <AssignmentStatsCard assignments={assignments} />
        
        {/* Assignments table */}
        <AssignmentsTable 
          assignments={assignments}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onStatusChange={handleStatusChange}
        />
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
