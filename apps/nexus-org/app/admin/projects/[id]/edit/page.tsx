'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { createClient } from '@/utils/supabase/client';
import { getProjectById, updateProject } from '@workspace/db/src/queries/projects';
import { Tables } from '@workspace/db/src/types';
import { toast } from 'sonner';

type ProjectRow = Tables<'projects'>;
type ProjectStatus = 'active' | 'completed' | 'archived';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        const { data, error } = await getProjectById(supabase, params.id);
        
        if (error) throw error;
        if (!data) throw new Error('Proyecto no encontrado');
        
        setProject(data);
        
        // Initialize form state
        setName(data.name);
        setDescription(data.description || '');
        setStatus(data.status as ProjectStatus);
        setStartDate(data.start_date ? new Date(data.start_date) : undefined);
        setEndDate(data.end_date ? new Date(data.end_date) : undefined);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles del proyecto');
        toast.error('Error al cargar los detalles del proyecto');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id]);

  const handleSave = async () => {
    if (!project) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Validate input
      if (!name.trim()) {
        toast.error('El nombre del proyecto es requerido');
        return;
      }
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No se pudo obtener información del usuario.');
      }
      
      // Prepare updates object
      const updates = {
        name,
        description: description || null,
        status,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
      };
      
      // Update project
      const { data, error } = await updateProject(
        supabase,
        project.id,
        updates,
        user.id
      );
      
      if (error) throw error;
      
      toast.success('Proyecto actualizado', {
        description: 'Los cambios han sido guardados correctamente'
      });
      
      // Navigate back to project details
      router.push(`/admin/projects/${project.id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el proyecto');
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando detalles del proyecto...</span>
      </div>
    );
  }

  if (error && !project) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert className="my-4">
        <AlertTitle>Proyecto no encontrado</AlertTitle>
        <AlertDescription>No se pudo encontrar el proyecto solicitado.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/projects/${project.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-2xl font-bold">Editar Proyecto</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
          <CardDescription>Modifica la información del proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="project-name">Nombre del Proyecto *</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del proyecto"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="project-description">Descripción</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del proyecto"
                rows={3}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="project-status">Estado del Proyecto</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as ProjectStatus)}
              >
                <SelectTrigger id="project-status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="start-date">Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="end-date">Fecha de Finalización</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/projects/${project.id}`)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
