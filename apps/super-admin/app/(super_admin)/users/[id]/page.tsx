import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import GeneralTab from "./tabs/GeneralTab";
import ActivityLogTab from "./tabs/ActivityLogTab";
import SecurityTab from "./tabs/SecurityTab";
import ConfigurationTab from "./tabs/ConfigurationTab";

export default async function UserDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/");
  }

  // Fetch user details
  const { data: userData, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organizations(name)
    `)
    .eq('id', params.id)
    .single();

  if (error || !userData) {
    console.error('Error fetching user details:', error);
    return redirect("/organizations");
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{userData.first_name} {userData.last_name}</h1>
          <p className="text-muted-foreground">
            Usuario de {userData.organizations?.name}
          </p>
        </div>
        <Link href={`/organizations/${encodeURIComponent(userData.organizations?.name)}/users`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Editar usuarios
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="activity">Registro de actividad</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="configuration">Configuración</TabsTrigger>
        </TabsList>
        
        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="general">
              <GeneralTab userData={userData} formatDate={formatDate} />
            </TabsContent>
            
            <TabsContent value="activity">
              <ActivityLogTab userId={params.id} />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityTab userId={params.id} userData={userData} />
            </TabsContent>
            
            <TabsContent value="configuration">
              <ConfigurationTab userData={userData} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
