import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontal } from "lucide-react";
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
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Project } from "@workspace/types";

const statusVariantMap: Record<string, string> = {
  active: "border-green-500/50 bg-green-50/50 dark:bg-green-950/50",
  completed: "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/50",
  archived: "border-gray-200 bg-gray-50/50 dark:bg-gray-800/50",
} as const;

interface ProjectCardProps {
  project: Project & { organization?: { name: string } };
  formatDate: (dateString: string) => string;
}

export function ProjectCard({ project, formatDate }: ProjectCardProps) {
  const router = useRouter();

  return (
    <Card 
      key={project.id} 
      className={cn(
        "relative",
        statusVariantMap[project.status.toLowerCase()] || statusVariantMap.archived
      )}
    >
      <CardHeader className="grid gap-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              {project.organization?.name ?? `ID: ${project.organization_id}`}
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(project.id)}
              >
                Copiar ID del Proyecto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Archivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-medium">{project.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Creado:</span>
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
