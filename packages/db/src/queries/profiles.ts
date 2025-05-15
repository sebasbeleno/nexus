import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '../types';

// Type aliases for convenience
type ProfileRow = Tables<'profiles'>;
type UserRole = Database['public']['Enums']['user_role'];

/**
 * Fetches all user profiles
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with profiles data or error
 */
export async function getAllProfiles(
  supabase: SupabaseClient<Database>
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_name');

  if (error) {
    console.error('Error fetching all profiles:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches a user profile by ID
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @returns Promise with profile data or error
 */
export async function getProfileById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching profile with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches a user profile by email
 * 
 * @param supabase - Supabase client instance
 * @param email - User email
 * @returns Promise with profile data or error
 */
export async function getProfileByEmail(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error(`Error fetching profile with email ${email}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Creates a new user profile
 * 
 * @param supabase - Supabase client instance
 * @param profile - Profile data
 * @returns Promise with created profile data or error
 */
export async function createProfile(
  supabase: SupabaseClient<Database>,
  profile: TablesInsert<'profiles'>
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  // Set default values if not provided
  const now = new Date().toISOString();
  const profileWithDefaults = {
    ...profile,
    created_at: profile.created_at || now,
    updated_at: profile.updated_at || now,
    is_active: profile.is_active ?? true,
    account_locked: profile.account_locked ?? false,
    failed_login_attempts: profile.failed_login_attempts ?? 0,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates an existing user profile
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param updates - Profile fields to update
 * @returns Promise with updated profile data or error
 */
export async function updateProfile(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: TablesUpdate<'profiles'>
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  // Include updated_at timestamp
  const updatesWithTimestamp = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updatesWithTimestamp)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating profile ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates a user's profile image URL
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param imageUrl - New profile image URL
 * @returns Promise with updated profile data or error
 */
export async function updateProfileImage(
  supabase: SupabaseClient<Database>,
  id: string,
  imageUrl: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      profile_image_url: imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating profile image for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates a user's role
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param role - New user role
 * @returns Promise with updated profile data or error
 */
export async function updateUserRole(
  supabase: SupabaseClient<Database>,
  id: string,
  role: UserRole
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating role for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Activates or deactivates a user account
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param isActive - Whether the account should be active
 * @returns Promise with updated profile data or error
 */
export async function setUserActiveStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error ${isActive ? 'activating' : 'deactivating'} user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Locks or unlocks a user account
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param isLocked - Whether the account should be locked
 * @returns Promise with updated profile data or error
 */
export async function setAccountLockStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  isLocked: boolean
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const updates: TablesUpdate<'profiles'> = { 
    account_locked: isLocked,
    updated_at: new Date().toISOString()
  };
  
  // Reset failed login attempts when unlocking an account
  if (!isLocked) {
    updates.failed_login_attempts = 0;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error ${isLocked ? 'locking' : 'unlocking'} account for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Incrementes failed login attempts and optionally locks the account
 * 
 * @param supabase - Supabase client instance
 * @param email - User email
 * @param maxAttempts - Max allowed attempts before locking (default: 5)
 * @returns Promise with updated profile data or error
 */
export async function incrementFailedLoginAttempt(
  supabase: SupabaseClient<Database>,
  email: string,
  maxAttempts: number = 5
): Promise<{ data: ProfileRow | null; error: Error | null; isLocked: boolean }> {
  // First get current failed attempts
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, failed_login_attempts')
    .eq('email', email)
    .single();

  if (fetchError) {
    console.error(`Error fetching profile for ${email}:`, fetchError);
    return { 
      data: null, 
      error: new Error(fetchError.message),
      isLocked: false
    };
  }

  const currentAttempts = profile.failed_login_attempts || 0;
  const newAttempts = currentAttempts + 1;
  const shouldLock = newAttempts >= maxAttempts;
  
  // Update the profile with new attempt count and lock if necessary
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      failed_login_attempts: newAttempts,
      account_locked: shouldLock ? true : false,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating failed login attempts for ${email}:`, error);
    return { 
      data: null, 
      error: new Error(error.message),
      isLocked: false
    };
  }
  
  return { 
    data, 
    error: null,
    isLocked: shouldLock
  };
}

/**
 * Updates the last login timestamp for a user
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @returns Promise with updated profile data or error
 */
export async function updateLastLogin(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      last_login: now,
      failed_login_attempts: 0, // Reset failed attempts on successful login
      updated_at: now
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating last login for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches profiles by role
 * 
 * @param supabase - Supabase client instance
 * @param role - User role to filter by
 * @returns Promise with profiles data or error
 */
export async function getProfilesByRole(
  supabase: SupabaseClient<Database>,
  role: UserRole
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('last_name');

  if (error) {
    console.error(`Error fetching profiles with role ${role}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches active profiles in an organization
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - Organization ID
 * @returns Promise with profiles data or error
 */
export async function getActiveProfilesByOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('last_name');

  if (error) {
    console.error(`Error fetching active profiles for organization ${organizationId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Searches for profiles by name or email
 * 
 * @param supabase - Supabase client instance
 * @param searchTerm - Search term for name or email
 * @returns Promise with matching profiles data or error
 */
export async function searchProfiles(
  supabase: SupabaseClient<Database>,
  searchTerm: string
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order('last_name');

  if (error) {
    console.error(`Error searching profiles with term "${searchTerm}":`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Records user consent to data processing
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @param hasConsented - Whether user has consented
 * @returns Promise with updated profile data or error
 */
export async function updateConsentStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  hasConsented: boolean
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      consent_to_data_processing: hasConsented,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating consent status for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates password change timestamp (for tracking password age)
 * 
 * @param supabase - Supabase client instance
 * @param id - User ID
 * @returns Promise with updated profile data or error
 */
export async function updatePasswordChangedTimestamp(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      password_last_changed: now,
      updated_at: now
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating password changed timestamp for user ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}
