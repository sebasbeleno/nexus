"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { createClient } from '@/utils/supabase/client';
import { createProject } from '@workspace/db/src/queries/projects';

const projectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es requerido'),
  description: z.string().optional(),
});

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: () => void;
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  organizationId,
  onSuccess 
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = projectSchema.parse(formData);
      setIsSubmitting(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No se pudo obtener información del usuario.');
      }

      // Create the project
      const { data, error } = await createProject(supabase, {
        name: validatedData.name,
        description: validatedData.description || null,
        organization_id: organizationId,
        status: 'active',
        created_by: user.id,
        updated_by: user.id,
      });

      if (error) throw error;

      toast.success('Proyecto creado correctamente', {
        description: `El proyecto "${validatedData.name}" ha sido creado con éxito.`
      });

      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.issues.reduce((acc, issue) => ({
          ...acc,
          [String(issue.path[0])]: issue.message,
        }), {}));
      } else {
        toast.error('Error al crear el proyecto', {
          description: err instanceof Error ? err.message : 'Ocurrió un error inesperado'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo proyecto</DialogTitle>
          <DialogDescription>
            Complete los detalles del proyecto. Los campos marcados con * son requeridos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ingrese el nombre del proyecto"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ingrese una descripción del proyecto"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
