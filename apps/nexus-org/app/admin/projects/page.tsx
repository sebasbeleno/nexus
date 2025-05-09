'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { getUserOrganization } from '@workspace/db/src/queries/organizations';
import { getProjectsByOrganization } from '@workspace/db/src/queries/projects';
import { Tables } from '@workspace/db/src/types';
import { CreateProjectDialog } from '@/components/create-project-dialog';

type ProjectRow = Tables<'projects'>;

export default function AdminProjectsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user's organization and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('No se pudo obtener información del usuario.');
          return;
        }
        
        // Get user's organization
        const { data: orgData, error: orgError } = await getUserOrganization(supabase, user.id);
        
        if (orgError || !orgData) {
          setError('No se pudo obtener información de la organización.');
          return;
        }

        setOrganizationId(orgData.id);
        
        // Fetch projects for this organization
        const { data: projectsData, error: projectsError } = await getProjectsByOrganization(
          supabase,
          orgData.id
        );
        
        if (projectsError) {
          throw projectsError;
        }
        
        setProjects(projectsData || []);
        setFilteredProjects(projectsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
        toast.error('Error al cargar los datos', {
          description: 'No se pudieron cargar los proyectos. Por favor, intente de nuevo más tarde.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter projects based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(lowercasedQuery) || 
      (project.description && project.description.toLowerCase().includes(lowercasedQuery))
    );
    
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  // Handle project refresh after creation or deletion
  const handleRefreshProjects = async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await getProjectsByOrganization(supabase, organizationId);
      
      if (error) throw error;
      
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      toast.error('Error al actualizar proyectos', {
        description: 'No se pudieron cargar los proyectos actualizados.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        {/* <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear proyecto
        </Button> */}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar proyectos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando proyectos...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredProjects.length === 0 ? (
        <Alert>
          <AlertTitle>
            {searchQuery ? 'No se encontraron resultados' : 'No hay proyectos'}
          </AlertTitle>
          <AlertDescription>
            {searchQuery
              ? 'No hay proyectos que coincidan con tu búsqueda. Intenta con otros términos.'
              : 'No hay proyectos creados para esta organización. Crea tu primer proyecto.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleRefreshProjects}
            />
          ))}
        </div>
      )}

      {organizationId && (
        <CreateProjectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          organizationId={organizationId}
          onSuccess={handleRefreshProjects}
        />
      )}
    </div>
  );
}
