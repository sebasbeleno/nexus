import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Key, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface SecurityTabProps {
  user: {
    id: string;
    is_active: boolean;
    two_factor_auth?: boolean;
    email: string;
  };
  handleInputChange: (field: string, value: any) => void;
}

export default function SecurityTab({ user, handleInputChange }: SecurityTabProps) {
  const [resettingPassword, setResettingPassword] = useState(false);
  const supabase = createClient();
  
  const handleResetPassword = async () => {
    try {
      setResettingPassword(true);
      
      // You would implement the password reset here
      // This is a placeholder for the actual implementation
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Correo de restablecimiento enviado", {
        description: "Se ha enviado un correo electrónico para restablecer la contraseña."
      });
    } catch (error: any) {
      toast.error("Error al enviar el correo de restablecimiento", {
        description: error.message
      });
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>
          Gestiona la seguridad y el acceso de la cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active-status">Estado de la cuenta</Label>
              <p className="text-sm text-muted-foreground">
                Activa o desactiva el acceso del usuario a la plataforma
              </p>
            </div>
            <Switch 
              id="active-status"
              checked={user.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Autenticación de dos factores</Label>
              <p className="text-sm text-muted-foreground">
                Habilita la verificación en dos pasos para mejorar la seguridad
              </p>
            </div>
            <Switch 
              id="two-factor"
              checked={user.two_factor_auth || false}
              onCheckedChange={(checked) => handleInputChange("two_factor_auth", checked)}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <h3 className="text-sm font-medium flex items-center mb-2">
            <Shield className="h-4 w-4 mr-1" />
            Acciones de seguridad
          </h3>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleResetPassword} 
              disabled={resettingPassword}
            >
              <Key className="h-4 w-4 mr-2" />
              {resettingPassword ? "Enviando..." : "Restablecer contraseña"}
            </Button>
            
            <div className="border rounded-md p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Zona de peligro</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Las operaciones en esta zona son permanentes y no se pueden deshacer.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="mt-2"
                    size="sm"
                  >
                    Eliminar usuario
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
