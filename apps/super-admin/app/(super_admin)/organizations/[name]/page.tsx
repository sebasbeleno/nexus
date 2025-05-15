import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createClient } from "@/utils/supabase/server";  // Changed to server client
import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import { GeneralTab } from "./components/general-tab";
import { ActivityLogTab } from "./components/activity-log-tab";
import { SettingsTab } from "./components/settings-tab";
import { ProjectsTab } from "./components/projects-tab";
import { use } from "react";

export default async function OrganizationDetailsPage({ 
  params 
}: { 
  params: Promise<{ name: string }>
}) {
  const { name } = use(params);
  const organizationName = decodeURIComponent(name);
  const supabase = await createClient();
  
  // Verify user authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }
  
  try {
    // Fetch organization details by name
    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        *,
        active_users:profiles(count)
      `)
      .eq('name', organizationName)
      .single();
      
    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }

    if (!organization) {
      console.error('Organization not found');
      return redirect("/organizations");
    }

    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              Detalles de la organización y configuración
            </p>
          </div>
          <Button asChild>
            <a href={`/organizations/${encodeURIComponent(organization.name)}/users`}>
              <Users className="h-4 w-4 mr-2" />
              Ver Usuarios
            </a>
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralTab organization={organization} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsTab organization={organization} />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityLogTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab organization={organization} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error in organization details page:', error);
    return redirect("/organizations");
  }
}
