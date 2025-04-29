import { Mail, User, Shield, Calendar, CheckCircle, XCircle, Key, Clock, Pencil, UserCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

interface UserData {
  id: string; 
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  is_active: boolean;
  organizations: {
    name: string;
  };
  last_login?: string;
  two_factor_auth?: boolean;
}

interface GeneralTabProps {
  userData: UserData;
  formatDate: (dateString: string) => string;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ userData, formatDate }) => {
  // Function to get initials from first and last name
  const getInitials = () => {
    return `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`.toUpperCase();
  };

  // Function to determine status badge color
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Activo</Badge>
    ) : (
      <Badge variant="destructive">Inactivo</Badge>
    );
  };

  // Function to determine 2FA status badge
  const get2FABadge = (enabled?: boolean) => {
    return enabled ? (
      <Badge variant="default">Habilitado</Badge>
    ) : (
      <Badge variant="outline">No habilitado</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid layout for the cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Card - User Information */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Información del usuario</CardTitle>
              <CardDescription>Detalles básicos sobre el usuario</CardDescription>
            </div>
            <Link href={`/users/${userData.id}/edit`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar usuario</span>
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{userData.first_name} {userData.last_name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {userData.role} en {userData.organizations?.name}
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Email:</span>
                  <span>{userData.email}</span>
                </div>
              </li>
              <li className="flex items-start">
                <User className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Nombre completo:</span>
                  <span>{userData.first_name} {userData.last_name}</span>
                </div>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Rol:</span>
                  <span className="capitalize">{userData.role}</span>
                </div>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Fecha de creación:</span>
                  <span>{formatDate(userData.created_at)}</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Second Card - Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de la cuenta</CardTitle>
            <CardDescription>Estado actual y seguridad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {userData.is_active ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium">Estado</span>
              </div>
              {getStatusBadge(userData.is_active)}
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Último acceso</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {userData.last_login ? formatDate(userData.last_login) : "Nunca"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Autenticación de dos factores</span>
              </div>
              {get2FABadge(userData.two_factor_auth)}
            </div>
            
            <Separator />
            
            <Button variant="outline" className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Restablecer contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Third Card - Full width in second row */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCircle2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Perfil del usuario</CardTitle>
          </div>
          <CardDescription>
            Información adicional del perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-center p-6 border rounded-lg border-dashed">
            <div className="flex flex-col items-center text-center space-y-2">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No hay información adicional del perfil disponible</p>
              <Button variant="outline" size="sm">
                Completar perfil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
