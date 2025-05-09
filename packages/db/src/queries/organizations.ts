import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '../types';

// Type aliases for convenience
type OrganizationRow = Tables<'organizations'>;
type ProfileRow = Tables<'profiles'>;

/**
 * Fetches all organizations
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with organizations data or error
 */
export async function getAllOrganizations(
  supabase: SupabaseClient<Database>
): Promise<{ data: OrganizationRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching all organizations:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches an organization by ID
 * 
 * @param supabase - Supabase client instance
 * @param id - Organization ID
 * @returns Promise with organization data or error
 */
export async function getOrganizationById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: OrganizationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching organization with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches organizations with active status
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with active organizations data or error
 */
export async function getActiveOrganizations(
  supabase: SupabaseClient<Database>
): Promise<{ data: OrganizationRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching active organizations:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches the organization a user belongs to
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Promise with organization data or error
 */
export async function getUserOrganization(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ data: OrganizationRow | null; error: Error | null }> {
  // First fetch the user profile to get the organization_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.organization_id) {
    console.error(`Error fetching user's organization_id for user ${userId}:`, profileError);
    return { 
      data: null, 
      error: new Error(profileError?.message || 'User has no organization assigned') 
    };
  }

  // Then fetch the organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (orgError) {
    console.error(`Error fetching organization for user ${userId}:`, orgError);
    return { data: null, error: new Error(orgError.message) };
  }
  
  return { data: organization, error: null };
}

/**
 * Fetches users belonging to a specific organization
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - Organization ID
 * @returns Promise with users data or error
 */
export async function getOrganizationUsers(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('last_name');

  if (error) {
    console.error(`Error fetching users for organization ${organizationId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Creates a new organization
 * 
 * @param supabase - Supabase client instance
 * @param organization - Organization data
 * @returns Promise with the created organization data or error
 */
export async function createOrganization(
  supabase: SupabaseClient<Database>,
  organization: TablesInsert<'organizations'>
): Promise<{ data: OrganizationRow | null; error: Error | null }> {
  // Set default values if not provided
  const organizationWithDefaults = {
    ...organization,
    status: organization.status || 'active',
    data_retention_period: organization.data_retention_period || 365, // Default to 1 year
    created_at: organization.created_at || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organizations')
    .insert(organizationWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates an existing organization
 * 
 * @param supabase - Supabase client instance
 * @param id - Organization ID
 * @param updates - Organization fields to update
 * @returns Promise with the updated organization data or error
 */
export async function updateOrganization(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: TablesUpdate<'organizations'>
): Promise<{ data: OrganizationRow | null; error: Error | null }> {
  // Include updated_at timestamp
  const updatesWithTimestamp = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organizations')
    .update(updatesWithTimestamp)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating organization ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Changes an organization's status
 * 
 * @param supabase - Supabase client instance
 * @param id - Organization ID
 * @param status - New status ('active', 'inactive', or 'suspended')
 * @returns Promise with the updated organization data or error
 */
export async function changeOrganizationStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: Database['public']['Enums']['organization_status']
): Promise<{ data: OrganizationRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error changing status for organization ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Assigns a user to an organization
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @returns Promise with success/error status
 */
export async function assignUserToOrganization(
  supabase: SupabaseClient<Database>,
  userId: string,
  organizationId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: organizationId, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error(`Error assigning user ${userId} to organization ${organizationId}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}

/**
 * Removes a user from an organization
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Promise with success/error status
 */
export async function removeUserFromOrganization(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: null, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error(`Error removing user ${userId} from organization:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}

/**
 * Searches for organizations by name
 * 
 * @param supabase - Supabase client instance
 * @param searchTerm - Search term for organization name
 * @returns Promise with matching organizations data or error
 */
export async function searchOrganizationsByName(
  supabase: SupabaseClient<Database>,
  searchTerm: string
): Promise<{ data: OrganizationRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name');

  if (error) {
    console.error(`Error searching organizations with term "${searchTerm}":`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Counts users in an organization
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - Organization ID
 * @returns Promise with user count or error
 */
export async function countOrganizationUsers(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<{ count: number | null; error: Error | null }> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (error) {
    console.error(`Error counting users for organization ${organizationId}:`, error);
    return { count: null, error: new Error(error.message) };
  }
  return { count, error: null };
}