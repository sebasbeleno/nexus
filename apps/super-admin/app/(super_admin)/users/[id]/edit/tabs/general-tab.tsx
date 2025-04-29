import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

interface GeneralTabProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  handleInputChange: (field: string, value: any) => void;
}

export default function GeneralTab({ user, handleInputChange }: GeneralTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
        <CardDescription>
          Información básica del usuario como nombre, apellido y correo electrónico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={user.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={user.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
