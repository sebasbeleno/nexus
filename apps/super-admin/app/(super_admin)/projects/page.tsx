"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@/components/data-table"; // Adjust path if necessary
import { Project } from "@workspace/types"; // Import the Project type
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Loader2, AlertCircle, Info } from "lucide-react"; // Import icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Link from "next/link";
import { useFetchProjects } from "@/hooks/use-fetch-projects"; // Import the hook
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"; // Import Alert components
import { CreateProjectDialog } from "@/components/create-project-dialog";

// Define columns for the DataTable (keep this definition)
export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "organization_id", // Consider fetching and displaying organization name
    header: "Organización ID",
  },
  {
    accessorKey: "status",
    header: "Estado",
  },
  {
    accessorKey: "created_at",
    header: "Creado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      // Format date more robustly, handle potential invalid dates
      return <span>{isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(project.id)}
            >
              Copiar ID del Proyecto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Add links/actions for Edit, View Details, Archive later */}
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Archivar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ProjectsPage() {
  const { projects, isLoading, error, refetch } = useFetchProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Crear Proyecto
        </Button>
      </div>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando proyectos...</span>
        </div>
      )}

      {error && !isLoading && (
         <Alert variant="destructive" className="mb-6">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error al cargar proyectos</AlertTitle>
           <AlertDescription>
             {error.message || "Ocurrió un error inesperado."}
             <Button variant="link" onClick={refetch} className="ml-2 p-0 h-auto">
               Intentar de nuevo
             </Button>
           </AlertDescription>
         </Alert>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>No hay proyectos</AlertTitle>
          <AlertDescription>
            Aún no se han creado proyectos. ¡Crea el primero!
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <DataTable columns={columns} data={projects} />
      )}
    </div>
  );
}
