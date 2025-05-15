"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { InfoTab } from "./components/info-tab";
import { ContactTab } from "./components/contact-tab";
import { AdvancedTab } from "./components/advanced-tab";

export default function EditOrganizationPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const organizationName = decodeURIComponent(name);
  const supabase = createClient();

  // Fetch organization data
  useEffect(() => {
    async function fetchOrganization() {
      try {
        const { data: organization, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('name', organizationName)
          .single();

        if (error) throw error;
        setOrganization(organization);
      } catch (error) {
        console.error('Error fetching organization:', error);
        toast("Error", {
          description: "No se pudo cargar la información de la organización."
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [organizationName]);

  const handleInputChange = (field: string, value: any) => {
    setOrganization((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          notes: organization.notes,
          contact_email: organization.contact_email,
          contact_phone: organization.contact_phone,
          address: organization.address,
          logo_url: organization.logo_url,
          status: organization.status,
          data_retention_period: organization.data_retention_period,
          metadata: organization.metadata
        })
        .eq('id', organization.id);

      if (error) throw error;
      
      toast("Cambios guardados", {
        description: "La organización se ha actualizado correctamente.",
      });
      
      router.push(`/organizations/${encodeURIComponent(organization.name)}`);
    } catch (error) {
      console.error('Error updating organization:', error);
      toast("Error", {
        description: "No se pudieron guardar los cambios."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrganization = async () => {
    setDeleting(true);
    
    try {
      // First, delete all users associated with this organization
      const { error: usersError } = await supabase
        .from('profiles')
        .delete()
        .eq('organization_id', organization.id);
        
      if (usersError) {
        throw new Error(`Error al eliminar usuarios: ${usersError.message}`);
      }
      
      // Then, delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id);

      if (error) throw error;
      
      toast("Organización eliminada", {
        description: "La organización y todos sus usuarios han sido eliminados permanentemente.",
      });
      
      router.push('/organizations');
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast("Error", {
        description: error.message || "No se pudo eliminar la organización. Inténtelo de nuevo más tarde."
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">Organización no encontrada</h2>
            <p className="text-muted-foreground mb-4">No se pudo encontrar la información de la organización solicitada.</p>
            <Link href="/organizations">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a organizaciones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Editar {organization.name}</h1>
        <p className="text-muted-foreground">
          Actualización de la información y configuración de la organización
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="info">Información adicional</TabsTrigger>
            <TabsTrigger value="contact">Detalles de contacto</TabsTrigger>
            <TabsTrigger value="advanced">Configuración avanzada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <InfoTab 
              organization={organization} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>
          
          <TabsContent value="contact">
            <ContactTab 
              organization={organization} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedTab 
              organization={organization} 
              handleInputChange={handleInputChange} 
              handleDeleteOrganization={handleDeleteOrganization}
              deleting={deleting}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4 mt-6">
          <Link href={`/organizations/${encodeURIComponent(organization.name)}`}>
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
