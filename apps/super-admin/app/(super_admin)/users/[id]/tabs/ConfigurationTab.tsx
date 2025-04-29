import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Bell, Settings, UserCog } from "lucide-react";

interface UserData {
  role: string;
  is_active: boolean;
}

interface ConfigurationTabProps {
  userData: UserData;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({ userData }) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Ajusta la configuración y permisos del usuario en el sistema
      </p>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Permisos del usuario</CardTitle>
          </div>
          <CardDescription>Configura el nivel de acceso y rol del usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select defaultValue={userData.role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="access">Acceso al sistema</Label>
              <p className="text-sm text-muted-foreground">Permitir acceso a la plataforma</p>
            </div>
            <Switch id="access" defaultChecked={userData.is_active} />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar cambios</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notificaciones</CardTitle>
          </div>
          <CardDescription>Configura las notificaciones que recibe el usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notif">Notificaciones por email</Label>
            <Switch id="email-notif" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notif">Notificaciones del sistema</Label>
            <Switch id="system-notif" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Preferencias</CardTitle>
          </div>
          <CardDescription>Configura preferencias adicionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select defaultValue="es">
              <SelectTrigger id="language">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Guardar preferencias</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfigurationTab;
