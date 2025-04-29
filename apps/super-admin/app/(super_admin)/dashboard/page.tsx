import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import { UsersRound, Building } from "lucide-react";
import { SystemLogs } from "@/components/system-logs";

export type Log = {
  id: string
  created_at: string
  ip_address: string
  action_type: string
  details: any
  user: {
    first_name: string
  }
}


// Function to get organizations and active users count
async function getStats(supabase: SupabaseClient<any, "public", any>) {
  // Get total count of organizations
  const { count: organizationsCount, error: orgError } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });
  
  if (orgError) {
    console.error('Error fetching organizations count:', orgError);
  }

  // Get total count of active users with organizations
  const { count: activeUsersCount, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('organization_id', 'is', null); // Only users with an assigned organization

  if (usersError) {
    console.error('Error fetching active users count:', usersError);
  }
  
  return {
    totalOrganizations: organizationsCount || 0,
    totalActiveUsers: activeUsersCount || 0
  };
}

// Function to get logs for the main dashboard table
async function getLogs(supabase: SupabaseClient<any, "public", any>): Promise<Log[]> {
  // Query logs table and join with users to get user name
  const { data, error } = await supabase
    .from('logs')
    .select(`
      id,
      created_at,
      ip_address,
      action_type,
      details,
      user:users(first_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }

  console.log("data", data);

  // Transform the data to match the Log type
  return data.map((log: any) => ({
    id: log.id,
    created_at: log.created_at,
    ip_address: log.ip_address || 'Unknown IP',
    action_type: log.action_type,
    details: log.details || {},
    user: {
      first_name: log.user?.first_name || 'El Sistema'
    }
  }));
}

export default async function Dashboard() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }
  
  const logs = await getLogs(supabase);
  const { totalOrganizations, totalActiveUsers } = await getStats(supabase);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">Organizaciones activas en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios asignados a organizaciones</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <SystemLogs logs={logs} />
      </div>
    </>
  );
}
