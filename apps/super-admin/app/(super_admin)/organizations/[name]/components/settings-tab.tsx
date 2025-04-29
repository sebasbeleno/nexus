"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { AlertCircle, Loader2, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

export const SettingsTab = ({ organization }: { organization: any }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDeleteOrganization = async () => {
    try {
      setIsDeleting(true);
      
      // First, get all users of this organization
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', organization.id);
      
      if (usersError) {
        throw usersError;
      }
      
      // If there are users, delete them first
      if (users && users.length > 0) {
        // Extract user IDs
        const userIds = users.map(user => user.id);
        
        // Delete all users of this organization
        const { error: deleteUsersError } = await supabase
          .from('users')
          .delete()
          .in('id', userIds);
        
        if (deleteUsersError) {
          throw deleteUsersError;
        }
        
        console.log(`Deleted ${users.length} users from organization`);
      }
      
      // Now delete the organization itself
      const { error: deleteOrgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id);
      
      if (deleteOrgError) {
        throw deleteOrgError;
      }
      
      // Show success message
      toast.success("Organización eliminada", {
        description: `La organización y ${users?.length || 0} usuarios han sido eliminados correctamente`
      });
      
      // Redirect to organizations list
      router.push("/organizations");
      router.refresh();
      
    } catch (error: any) {
      console.error("Error deleting organization:", error);
      
      // Show error message
      toast.error("Error al eliminar la organización", {
        description: error.message || "Ha ocurrido un error al eliminar la organización y sus usuarios"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Organization Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la organización</CardTitle>
          <CardDescription>
            Gestiona la información y los usuarios de esta organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/organizations/${encodeURIComponent(organization.name)}/edit`}>
              <Button className="w-full" variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Editar organización
              </Button>
            </Link>
            
            <Link href={`/organizations/${encodeURIComponent(organization.name)}/users`}>
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Administrar usuarios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectan a toda la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar organización
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la organización &quot;{organization.name}&quot; 
                  junto con todos sus usuarios y datos asociados. Esta operación no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteOrganization} 
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar organización"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground mt-2">
            Esta acción eliminará permanentemente la organización, todos sus usuarios y datos asociados. No se puede deshacer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
