import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "../../../components/data-table";
import { CreateOrganizationDialog } from "./components/create-organization-dialog";
import { SupabaseClient } from "@supabase/supabase-js";
import { SearchInput } from "./components/search-input";
import { Organization } from "@workspace/types";

interface OrganizationResponse extends Organization {
  active_users: {
    count: number;
  }[];
}

async function getData(supabase: SupabaseClient<any, "public", any>): Promise<Partial<OrganizationResponse>[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      active_users:profiles(count)
    `)
    .eq('profiles.is_active', true)  // Only count active users
    .throwOnError();

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  // Transform the data to match the Organization interface if needed
  return data.map(org => ({
    id: org.id,
    name: org.name,
    users: org.active_users?.[0]?.count || 0, // Use the count of active users
    status: org.status || 'Inactive',
    created_at: new Date(org.created_at).toISOString().split('T')[0], // Format date as YYYY-MM-DD
  }));
}

export default async function Dashboard({ searchParams }: { searchParams?: { search?: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }
  
  let data = await getData(supabase);
  
  // Filter data based on search parameter
  const searchTerm = searchParams?.search?.toLowerCase();
  if (searchTerm) {
    data = data.filter((org) => 
      (org.name ?? '').toLowerCase().includes(searchTerm)
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Organizaciones</h1>
        
        <div className="flex justify-between items-center">
          <SearchInput placeholder="Buscar organización..." />
          <CreateOrganizationDialog />
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </>
  )
}
