import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface OrganizationTabProps {
  user: {
    id: string;
    role: string;
    organization_id: string;
    organizations?: {
      name: string;
    };
  };
  handleInputChange: (field: string, value: any) => void;
}

export default function OrganizationTab({ user, handleInputChange }: OrganizationTabProps) {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name');

        if (error) {
          throw error;
        }

        if (data) {
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organización y Rol</CardTitle>
        <CardDescription>
          Configura la organización y el rol del usuario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization">Organización</Label>
          <Select 
            value={user.organization_id} 
            onValueChange={(value) => handleInputChange("organization_id", value)}
            disabled={loading}
          >
            <SelectTrigger id="organization">
              <SelectValue placeholder="Selecciona una organización" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select 
            value={user.role} 
            onValueChange={(value) => handleInputChange("role", value)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
