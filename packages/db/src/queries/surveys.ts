import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '../types';

// Type aliases for convenience
type SurveyRow = Tables<'surveys'>;
type SurveyAssignmentRow = Tables<'survey_assignments'>;
type SurveyResponseRow = Tables<'survey_responses'>;
type ProfileRow = Tables<'profiles'>;

/**
 * Fetches all surveys
 * 
 * @param supabase - Supabase client instance
 * @returns Promise with surveys data or error
 */
export async function getAllSurveys(
  supabase: SupabaseClient<Database>
): Promise<{ data: SurveyRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all surveys:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches a survey by ID
 * 
 * @param supabase - Supabase client instance
 * @param id - Survey ID
 * @returns Promise with survey data or error
 */
export async function getSurveyById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: SurveyRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching survey with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches surveys by project ID
 * 
 * @param supabase - Supabase client instance
 * @param projectId - Project ID
 * @returns Promise with surveys data or error
 */
export async function getSurveysByProject(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<{ data: SurveyRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching surveys for project ${projectId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Fetches surveys with a deadline approaching within specified days
 * 
 * @param supabase - Supabase client instance
 * @param daysThreshold - Number of days to consider "approaching deadline" (default: 7)
 * @returns Promise with surveys data or error
 */
export async function getSurveysWithApproachingDeadlines(
  supabase: SupabaseClient<Database>,
  daysThreshold: number = 7
): Promise<{ data: SurveyRow[] | null; error: Error | null }> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);
  
  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .gte('deadline', todayStr)
    .lte('deadline', futureDateStr)
    .order('deadline');

  if (error) {
    console.error('Error fetching surveys with approaching deadlines:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Creates a new survey
 * 
 * @param supabase - Supabase client instance
 * @param survey - Survey data
 * @returns Promise with created survey data or error
 */
export async function createSurvey(
  supabase: SupabaseClient<Database>,
  survey: TablesInsert<'surveys'>
): Promise<{ data: SurveyRow | null; error: Error | null }> {
  // Set default values if not provided
  const now = new Date().toISOString();
  const surveyWithDefaults = {
    ...survey,
    created_at: survey.created_at || now,
    updated_at: survey.updated_at || now,
    version: survey.version || 1,
  };

  const { data, error } = await supabase
    .from('surveys')
    .insert(surveyWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error creating survey:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates an existing survey
 * 
 * @param supabase - Supabase client instance
 * @param id - Survey ID
 * @param updates - Survey fields to update
 * @param incrementVersion - Whether to increment the version number (default: true)
 * @returns Promise with updated survey data or error
 */
export async function updateSurvey(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: TablesUpdate<'surveys'>,
  incrementVersion: boolean = true
): Promise<{ data: SurveyRow | null; error: Error | null }> {
  // Get the current version if we need to increment it
  let currentVersion = 1;

  if (incrementVersion) {
    const { data: currentSurvey, error: fetchError } = await supabase
      .from('surveys')
      .select('version')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`Error fetching current survey version for ${id}:`, fetchError);
      return { data: null, error: new Error(fetchError.message) };
    }

    currentVersion = currentSurvey.version || 1;
  }

  // Prepare updates with timestamp and version increment if needed
  const updatesToApply = {
    ...updates,
    updated_at: new Date().toISOString(),
    ...(incrementVersion ? { version: currentVersion + 1 } : {})
  };

  const { data, error } = await supabase
    .from('surveys')
    .update(updatesToApply)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating survey ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Searches for surveys by name
 * 
 * @param supabase - Supabase client instance
 * @param searchTerm - Search term for survey name
 * @returns Promise with matching surveys data or error
 */
export async function searchSurveysByName(
  supabase: SupabaseClient<Database>,
  searchTerm: string
): Promise<{ data: SurveyRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name');

  if (error) {
    console.error(`Error searching surveys with term "${searchTerm}":`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Assigns a survey to a user
 * 
 * @param supabase - Supabase client instance
 * @param assignment - Survey assignment data
 * @returns Promise with created assignment data or error
 */
export async function assignSurvey(
  supabase: SupabaseClient<Database>,
  assignment: TablesInsert<'survey_assignments'>
): Promise<{ data: SurveyAssignmentRow | null; error: Error | null }> {
  // Set default values if not provided
  const assignmentWithDefaults = {
    ...assignment,
    assigned_at: assignment.assigned_at || new Date().toISOString(),
    status: assignment.status || 'assigned',
  };

  const { data, error } = await supabase
    .from('survey_assignments')
    .insert(assignmentWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error assigning survey:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Updates a survey assignment status
 * 
 * @param supabase - Supabase client instance
 * @param id - Assignment ID
 * @param status - New status
 * @returns Promise with updated assignment data or error
 */
export async function updateAssignmentStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: Database['public']['Enums']['assignment_status']
): Promise<{ data: SurveyAssignmentRow | null; error: Error | null }> {
  const updates: TablesUpdate<'survey_assignments'> = { status };
  
  // If cancelling, set cancelled_at timestamp
  if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('survey_assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating assignment status ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Gets all assignments for a survey
 * 
 * @param supabase - Supabase client instance
 * @param surveyId - Survey ID
 * @returns Promise with assignments data or error
 */
export async function getAssignmentsBySurvey(
  supabase: SupabaseClient<Database>,
  surveyId: string
): Promise<{ data: SurveyAssignmentRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('survey_assignments')
    .select('*')
    .eq('survey_id', surveyId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error(`Error fetching assignments for survey ${surveyId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Gets all assignments for a user (surveyor)
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID (surveyor)
 * @param status - Optional status filter
 * @returns Promise with assignments data or error
 */
export async function getAssignmentsBySurveyor(
  supabase: SupabaseClient<Database>,
  userId: string,
  status?: Database['public']['Enums']['assignment_status'] | Database['public']['Enums']['assignment_status'][]
): Promise<{ data: SurveyAssignmentRow[] | null; error: Error | null }> {
  let query = supabase
    .from('survey_assignments')
    .select('*')
    .eq('surveyor_user_id', userId);
  
  // Apply status filter if provided
  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }
  
  const { data, error } = await query.order('assigned_at', { ascending: false });

  if (error) {
    console.error(`Error fetching assignments for surveyor ${userId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Gets assignment details with survey and property information
 * 
 * @param supabase - Supabase client instance
 * @param assignmentId - Assignment ID
 * @returns Promise with detailed assignment data or error
 */
export async function getAssignmentDetails(
  supabase: SupabaseClient<Database>,
  assignmentId: string
): Promise<{ 
  data: (SurveyAssignmentRow & { survey: SurveyRow }) | null; 
  error: Error | null 
}> {
  const { data, error } = await supabase
    .from('survey_assignments')
    .select(`
      *,
      survey:surveys(*)
    `)
    .eq('id', assignmentId)
    .single();

  if (error) {
    console.error(`Error fetching assignment details ${assignmentId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Submits a survey response
 * 
 * @param supabase - Supabase client instance
 * @param response - Survey response data
 * @returns Promise with created response data or error
 */
export async function submitSurveyResponse(
  supabase: SupabaseClient<Database>,
  response: TablesInsert<'survey_responses'>
): Promise<{ data: SurveyResponseRow | null; error: Error | null }> {
  // Set default values if not provided
  const responseWithDefaults = {
    ...response,
    submitted_at: response.submitted_at || new Date().toISOString()
  };

  // Start a transaction to submit the response and update the assignment status
  // First, submit the response
  const { data, error } = await supabase
    .from('survey_responses')
    .insert(responseWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error submitting survey response:', error);
    return { data: null, error: new Error(error.message) };
  }

  // Then update the assignment status to 'in_review'
  const { error: updateError } = await supabase
    .from('survey_assignments')
    .update({ status: 'in_review' })
    .eq('id', responseWithDefaults.assignment_id);

  if (updateError) {
    console.error(`Error updating assignment status after submission:`, updateError);
    // We don't return an error here since the response was successfully submitted
    // But we log it for troubleshooting
  }

  return { data, error: null };
}

/**
 * Gets all responses for a survey
 * 
 * @param supabase - Supabase client instance
 * @param surveyId - Survey ID
 * @returns Promise with responses data or error
 */
export async function getResponsesBySurvey(
  supabase: SupabaseClient<Database>,
  surveyId: string
): Promise<{ data: (SurveyResponseRow & { assignment: SurveyAssignmentRow })[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select(`
      *,
      assignment:survey_assignments!inner(*)
    `)
    .eq('assignment.survey_id', surveyId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error(`Error fetching responses for survey ${surveyId}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

/**
 * Gets detailed survey statistics
 * 
 * @param supabase - Supabase client instance
 * @param surveyId - Survey ID
 * @returns Promise with survey stats or error
 */
export async function getSurveyStatistics(
  supabase: SupabaseClient<Database>,
  surveyId: string
): Promise<{ 
  data: { 
    totalAssignments: number,
    assignmentsByStatus: Record<Database['public']['Enums']['assignment_status'], number>,
    totalResponses: number,
    completionRate: number
  } | null; 
  error: Error | null 
}> {
  // First get assignment data
  const { data: assignments, error: assignmentsError } = await supabase
    .from('survey_assignments')
    .select('status')
    .eq('survey_id', surveyId);

  if (assignmentsError) {
    console.error(`Error fetching assignments for survey stats ${surveyId}:`, assignmentsError);
    return { data: null, error: new Error(assignmentsError.message) };
  }

  // Then get response count
  const { count: responseCount, error: responseError } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true })
    .eq('assignment.survey_id', surveyId)
    .eq('survey_assignments.survey_id', surveyId);

  if (responseError) {
    console.error(`Error counting responses for survey ${surveyId}:`, responseError);
    return { data: null, error: new Error(responseError.message) };
  }

  // Calculate statistics
  const totalAssignments = assignments.length;
  const responseCountValue = responseCount || 0;
  
  // Group assignments by status
  const assignmentsByStatus = assignments.reduce((acc, curr) => {
    const status = curr.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<Database['public']['Enums']['assignment_status'], number>);

  // Calculate completion rate (responses / assignments)
  const completionRate = totalAssignments > 0 ? (responseCountValue / totalAssignments) * 100 : 0;

  return {
    data: {
      totalAssignments,
      assignmentsByStatus,
      totalResponses: responseCountValue,
      completionRate
    },
    error: null
  };
}

/**
 * Gets recent surveys with their completion statistics
 * 
 * @param supabase - Supabase client instance
 * @param limit - Number of surveys to retrieve (default: 5)
 * @returns Promise with recent surveys and stats or error
 */
export async function getRecentSurveysWithStats(
  supabase: SupabaseClient<Database>,
  limit: number = 5
): Promise<{
  data: (SurveyRow & {
    assignmentCount: number;
    responseCount: number;
    completionRate: number;
  })[] | null;
  error: Error | null;
}> {
  // First get the most recent surveys
  const { data: surveys, error: surveysError } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (surveysError) {
    console.error('Error fetching recent surveys with stats:', surveysError);
    return { data: null, error: new Error(surveysError.message) };
  }

  // For each survey, get assignment and response counts
  const surveysWithStats = await Promise.all(
    surveys.map(async (survey) => {
      // Get assignment count
      const { count: assignmentCount, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', survey.id);

      if (assignmentError) {
        console.error(`Error counting assignments for survey ${survey.id}:`, assignmentError);
        return {
          ...survey,
          assignmentCount: 0,
          responseCount: 0,
          completionRate: 0
        };
      }

      // Get response count
      const { count: responseCount, error: responseError } = await supabase
        .from('survey_responses')
        .select('survey_responses.id', { count: 'exact', head: true })
        .eq('survey_assignments.survey_id', survey.id)
        .eq('survey_responses.assignment_id', 'survey_assignments.id');

      if (responseError) {
        console.error(`Error counting responses for survey ${survey.id}:`, responseError);
        return {
          ...survey,
          assignmentCount: assignmentCount || 0,
          responseCount: 0,
          completionRate: 0
        };
      }

      const assignmentCountValue = assignmentCount || 0;
      const responseCountValue = responseCount || 0;
      const completionRate = assignmentCountValue > 0 
        ? (responseCountValue / assignmentCountValue) * 100 
        : 0;

      return {
        ...survey,
        assignmentCount: assignmentCountValue,
        responseCount: responseCountValue,
        completionRate
      };
    })
  );

  return { data: surveysWithStats, error: null };
}
