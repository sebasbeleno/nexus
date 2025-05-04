"use client"
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { AlertTriangle, KeyRound, ShieldCheck, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

interface SecurityTabProps {
  userId: string;
  userData: {
    id: string;
    is_active: boolean;
    email: string;
  };
  handleInputChange?: (field: string, value: any) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ userId, userData, handleInputChange }) => {
  const [isBlocking, setIsBlocking] = useState(false);
  // Initialize isUserBlocked state from the userData
  const [isUserBlocked, setIsUserBlocked] = useState(!userData?.is_active);
  const supabase = createClient();

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setIsUserBlocked(!userData.is_active);
    }
  }, [userData]);

  const toggleBlockStatus = async () => {
    try {
      setIsBlocking(true);
      const newActiveStatus = isUserBlocked; // If currently blocked, we'll unblock (true)
      
      // Update user status in the database
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newActiveStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setIsUserBlocked(!newActiveStatus);
      
      // If handleInputChange is provided, update parent state
      if (handleInputChange) {
        handleInputChange("is_active", newActiveStatus);
      }

      toast.success(
        newActiveStatus ? "Usuario desbloqueado" : "Usuario bloqueado", 
        {
          description: newActiveStatus 
            ? "El usuario ha sido desbloqueado exitosamente" 
            : "El usuario ha sido bloqueado exitosamente"
        }
      );
    } catch (error: any) {
      toast.error(
        isUserBlocked ? "Error al desbloquear usuario" : "Error al bloquear usuario", 
        {
          description: error.message || "Hubo un problema al intentar modificar el estado del usuario"
        }
      );
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configura opciones de seguridad y acceso para este usuario
      </p>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Credenciales</CardTitle>
          </div>
          <CardDescription>Gestiona las credenciales de acceso del usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Contraseña</p>
            <p className="text-sm text-muted-foreground">
              La contraseña fue establecida por última vez en: 10/10/2023
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" disabled className="flex items-center">
                  Forzar cambio de contraseña
                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Próximamente disponible</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Autenticación de dos factores</CardTitle>
          </div>
          <CardDescription>Configura medidas de seguridad adicionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="2fa" className="font-medium">Autenticación de dos factores</Label>
              <p className="text-sm text-muted-foreground">
                Requiere un código adicional al iniciar sesión
              </p>
              <p className="text-xs text-blue-600 mt-1">Próximamente disponible</p>
            </div>
            <Switch id="2fa" disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-amber-700">Acciones de seguridad</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Estado de la cuenta</p>
            <p className="text-sm text-muted-foreground">
              {isUserBlocked 
                ? "El acceso del usuario a la plataforma está bloqueado" 
                : "El usuario tiene acceso activo a la plataforma"}
            </p>
            {isUserBlocked && (
              <p className="text-xs text-red-600 font-medium mt-1">
                Este usuario está actualmente bloqueado
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-medium">Cerrar sesiones activas</p>
            <p className="text-sm text-muted-foreground">
              Cierra todas las sesiones activas del usuario en todos los dispositivos
            </p>
            <p className="text-xs text-blue-600 mt-1">Próximamente disponible</p>
          </div>
        </CardContent>
        <CardFooter className="space-x-2">
          <Button 
            variant="outline" 
            disabled
            className="flex items-center"
          >
            Cerrar sesiones
            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
          
          {isUserBlocked ? (
            <Button 
              variant="outline" 
              onClick={toggleBlockStatus} 
              disabled={isBlocking}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Desbloqueando...
                </>
              ) : (
                "Desbloquear cuenta"
              )}
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={toggleBlockStatus} 
              disabled={isBlocking}
            >
              {isBlocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Bloqueando...
                </>
              ) : (
                "Bloquear cuenta"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecurityTab;
