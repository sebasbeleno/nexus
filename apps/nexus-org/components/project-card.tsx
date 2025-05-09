"use client";

import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { Tables } from "@workspace/db/src/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@workspace/ui/components/alert-dialog";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type ProjectRow = Tables<'projects'>;

const statusVariantMap: Record<string, string> = {
  active: "border-green-500 border-l-4",
  completed: "border-blue-500 border-l-4",
  archived: "border-gray-400 border-l-4",
};

const statusLabelMap: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  archived: "Archivado",
};

interface ProjectCardProps {
  project: ProjectRow;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No establecido";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const supabase = createClient();
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
      
      if (error) throw error;
      
      toast.success('Proyecto eliminado', {
        description: 'El proyecto ha sido eliminado correctamente'
      });
      
      onDelete();
    } catch (error) {
      toast.error('Error al eliminar el proyecto', {
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", statusVariantMap[project.status])}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              <CardDescription>
                {project.description ? (
                  <span className="line-clamp-2">{project.description}</span>
                ) : (
                  <span className="text-muted-foreground italic">Sin descripción</span>
                )}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project.id}`)}>
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project.id}/edit`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar proyecto
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar proyecto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Estado:</span>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {statusLabelMap[project.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Fecha de inicio:</span>
              <span className="text-sm font-medium">{formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Fecha de fin:</span>
              <span className="text-sm font-medium">{formatDate(project.end_date)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push(`/admin/projects/${project.id}`)}
          >
            Ver detalles
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el proyecto "{project.name}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar proyecto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
