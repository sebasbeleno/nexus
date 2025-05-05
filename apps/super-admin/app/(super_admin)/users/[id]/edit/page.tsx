"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import GeneralTab from "./tabs/general-tab";
import OrganizationTab from "./tabs/organization-tab";
import SecurityTab from "./tabs/security-tab";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const userId = params.id;
  const supabase = createClient();

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            organizations (
              name
            )
          `)
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUser(data);
        }
      } catch (error: any) {
        toast.error("Error al cargar el usuario", {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const handleInputChange = (field: string, value: any) => {
    setUser((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          // Add any other fields you want to update
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success("Usuario actualizado correctamente");
      router.push(`/users/${userId}`);
    } catch (error: any) {
      toast.error("Error al actualizar el usuario", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-semibold">Usuario no encontrado</h1>
        <Link href="/users" className="mt-4 text-blue-500 hover:underline">
          Volver a usuarios
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/users/${userId}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a detalles del usuario
          </Link>
          <h1 className="text-3xl font-semibold mb-1">Editar {user.first_name} {user.last_name}</h1>
          <p className="text-muted-foreground">Actualiza la información y configuración del usuario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <Card className="p-1">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="organization">Organización y Rol</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>
          </Card>
          
          <TabsContent value="general">
            <GeneralTab 
              user={user} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>
          
          <TabsContent value="organization">
            <OrganizationTab 
              user={user} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityTab 
              user={user} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4 mt-6">
          <Link href={`/users/${userId}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
