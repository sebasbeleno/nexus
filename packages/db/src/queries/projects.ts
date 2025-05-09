import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '../types';

// Type aliases for convenience
type ProjectRow = Tables<'projects'>;

/**
 * Fetches all projects
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with projects data or error
 */
export async function getAllProjects(
  supabase: SupabaseClient<Database>
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching all projects:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches a project by ID
 * 
 * @param supabase - Supabase client instance
 * @param id - Project ID
 * @returns Promise with project data or error
 */
export async function getProjectById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches projects by organization ID with optional filters
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - Organization ID
 * @param options - Optional filters (status, startDateFrom, startDateTo)
 * @returns Promise with projects data or error
 */
export async function getProjectsByOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  options?: {
    status?: Database['public']['Enums']['project_status'] | Database['public']['Enums']['project_status'][];
    startDateFrom?: string;
    startDateTo?: string;
  }
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId);

  // Apply status filter if provided
  if (options?.status) {
    if (Array.isArray(options.status)) {
      query = query.in('status', options.status);
    } else {
      query = query.eq('status', options.status);
    }
  }

  // Apply date filters if provided
  if (options?.startDateFrom) {
    query = query.gte('start_date', options.startDateFrom);
  }
  
  if (options?.startDateTo) {
    query = query.lte('start_date', options.startDateTo);
  }

  // Execute query with order
  const { data, error } = await query.order('name');

  if (error) {
    console.error(`Error fetching projects for organization ${organizationId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches active projects (status = 'active')
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with active projects data or error
 */
export async function getActiveProjects(
  supabase: SupabaseClient<Database>
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching active projects:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches projects created or updated by a specific user
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Promise with projects data or error
 */
export async function getProjectsByUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or(`created_by.eq.${userId},updated_by.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error(`Error fetching projects for user ${userId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Creates a new project
 * 
 * @param supabase - Supabase client instance
 * @param project - Project data
 * @returns Promise with the created project data or error
 */
export async function createProject(
  supabase: SupabaseClient<Database>,
  project: TablesInsert<'projects'>
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  // Set default values if not provided
  const now = new Date().toISOString();
  const projectWithDefaults = {
    ...project,
    status: project.status || 'active',
    created_at: project.created_at || now,
    updated_at: project.updated_at || now,
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(projectWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates an existing project
 * 
 * @param supabase - Supabase client instance
 * @param id - Project ID
 * @param updates - Project fields to update
 * @param updatedBy - User ID who is making the update
 * @returns Promise with the updated project data or error
 */
export async function updateProject(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: TablesUpdate<'projects'>,
  updatedBy: string
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  // Include updated_at timestamp and updated_by user
  const updatesWithMetadata = {
    ...updates,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };

  const { data, error } = await supabase
    .from('projects')
    .update(updatesWithMetadata)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Changes a project's status
 * 
 * @param supabase - Supabase client instance
 * @param id - Project ID
 * @param status - New status ('active', 'completed', or 'archived')
 * @param updatedBy - User ID who is making the update
 * @returns Promise with the updated project data or error
 */
export async function changeProjectStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: Database['public']['Enums']['project_status'],
  updatedBy: string
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error changing status for project ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches projects that are due to end soon (within specified days)
 * 
 * @param supabase - Supabase client instance
 * @param daysThreshold - Number of days to consider "ending soon" (default: 14)
 * @returns Promise with projects data or error
 */
export async function getProjectsEndingSoon(
  supabase: SupabaseClient<Database>,
  daysThreshold: number = 14
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);
  
  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', todayStr)
    .lte('end_date', futureDateStr)
    .order('end_date');

  if (error) {
    console.error('Error fetching projects ending soon:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Searches for projects by name
 * 
 * @param supabase - Supabase client instance
 * @param searchTerm - Search term for project name
 * @returns Promise with matching projects data or error
 */
export async function searchProjectsByName(
  supabase: SupabaseClient<Database>,
  searchTerm: string
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name');

  if (error) {
    console.error(`Error searching projects with term "${searchTerm}":`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Gets recently created or updated projects
 * 
 * @param supabase - Supabase client instance
 * @param limit - Number of projects to fetch (default: 5)
 * @returns Promise with recent projects data or error
 */
export async function getRecentProjects(
  supabase: SupabaseClient<Database>,
  limit: number = 5
): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent projects:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches project statistics by organization
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - Organization ID
 * @returns Promise with project stats or error
 */
export async function getProjectStatsByOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<{ 
  data: { 
    totalProjects: number,
    activeProjects: number,
    completedProjects: number,
    archivedProjects: number
  } | null; 
  error: Error | null 
}> {
  // Get counts by status
  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('organization_id', organizationId);

  if (error) {
    console.error(`Error fetching project stats for organization ${organizationId}:`, error);
    return { data: null, error: new Error(error.message) };
  }

  // Calculate stats
  const stats = {
    totalProjects: data.length,
    activeProjects: data.filter(p => p.status === 'active').length,
    completedProjects: data.filter(p => p.status === 'completed').length,
    archivedProjects: data.filter(p => p.status === 'archived').length,
  };
  
  return { data: stats, error: null };
}
