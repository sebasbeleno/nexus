import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useFetchOrganizations } from '@/hooks/use-fetch-organizations';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { createClient } from '@/utils/supabase/client';

const projectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es requerido'),
  organization_id: z.string().uuid('Selecciona una organización'),
});

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectDialog({ isOpen, onClose, onSuccess }: CreateProjectDialogProps) {
  const router = useRouter();
  const { organizations, isLoading: isLoadingOrgs } = useFetchOrganizations();
  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    try {
      const validatedData = projectSchema.parse(formData);
      setIsSubmitting(true);

      console.log('Creating project with data:', validatedData);

      const supabase = createClient();
      const {data: { user}} = await supabase.auth.getUser();

      const { error } = await supabase.from('projects').insert([{
        ...validatedData,
        status: 'active',
        created_by: user?.id,
        updated_by: user?.id,   
      }]);

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({ name: '', organization_id: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.issues.reduce((acc, issue) => ({
          ...acc,
          [String(issue.path[0])]: issue.message,
        }), {}));
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Error al crear el proyecto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo proyecto</DialogTitle>
          <DialogDescription>
            Complete los detalles del proyecto. Los campos marcados con * son requeridos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ingrese el nombre del proyecto"
              />
              {errors.name && (
                <span className="text-destructive text-sm">{errors.name}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization">Organización *</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => 
                  setFormData((prev) => ({ ...prev, organization_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una organización" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization_id && (
                <span className="text-destructive text-sm">{errors.organization_id}</span>
              )}
            </div>
          </div>

          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
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
