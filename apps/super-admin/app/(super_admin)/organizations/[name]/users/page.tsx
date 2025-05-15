import { createClient } from "@/utils/supabase/server";
import { DataTable } from "@/components/data-table";
import { SupabaseClient } from "@supabase/supabase-js";
import { columns } from "./columns";
import { redirect } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";

type User = {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	is_active: boolean;
	role: string;
	created_at: string;
};

async function getOrganizationByName(supabase: SupabaseClient<any, "public", any>, name: string) {
	const { data, error } = await supabase
		.from('organizations')
		.select('id, name')
		.eq('name', decodeURIComponent(name))
		.single();

	if (error) {
		console.error('Error fetching organization:', error);
		return null;
	}

	return data;
}

async function getOrganizationUsers(
	supabase: SupabaseClient<any, "public", any>,
	organizationId: string
): Promise<User[]> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('organization_id', organizationId);

	if (error) {
		console.error('Error fetching organization users:', error);
		return [];
	}

	return data.map((user: any) => ({
		id: user.id,
		email: user.email,
		first_name: user.first_name || '',
		last_name: user.last_name || '',
		is_active: user.is_active || false,
		role: user.role || 'user',
		created_at: user.created_at
			? new Date(user.created_at).toISOString().split('T')[0]
			: '',
	})) as User[];
}

export default async function OrganizationUsersPage({
	params
}: {
	params: Promise<{ name: string }>;
}) {
	const { name } = use(params);
	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		return redirect("/");
	}

	const organization = await getOrganizationByName(supabase, name);
	if (!organization) {
		return redirect("/organizations");
	}

	const users = await getOrganizationUsers(supabase, organization.id);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						{organization.name} - Usuarios
					</h1>
					<p className="text-sm text-muted-foreground">
						Gestiona los usuarios de esta organización
					</p>
				</div>
				<Link href={`/organizations/${name}/users/new`}>
					<Button>
						<PlusIcon className="mr-2 h-4 w-4" />
						Añadir Usuario
					</Button>
				</Link>
			</div>

			<DataTable columns={columns} data={users} />

		</div>
	);
}
