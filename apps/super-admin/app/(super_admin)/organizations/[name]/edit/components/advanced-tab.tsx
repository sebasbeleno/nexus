import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
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

interface AdvancedTabProps {
  organization: any;
  handleInputChange: (field: string, value: any) => void;
  handleDeleteOrganization: () => Promise<void>;
  deleting: boolean;
}

export function AdvancedTab({ 
  organization, 
  handleInputChange,
  handleDeleteOrganization,
  deleting
}: AdvancedTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select 
                defaultValue={organization.status || "inactive"}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_retention_period">Período de retención de datos (días)</Label>
              <Input 
                id="data_retention_period"
                type="number"
                value={organization.data_retention_period || 365}
                onChange={(e) => handleInputChange('data_retention_period', parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadatos (JSON)</Label>
            <Textarea 
              id="metadata"
              value={
                organization.metadata 
                  ? (typeof organization.metadata === 'string' 
                      ? organization.metadata 
                      : JSON.stringify(organization.metadata, null, 2))
                  : ''
              }
              onChange={(e) => {
                try {
                  // Try to parse as JSON if non-empty
                  const value = e.target.value.trim() 
                    ? JSON.parse(e.target.value)
                    : {};
                  handleInputChange('metadata', value);
                } catch (err) {
                  // If not valid JSON, store as string for now
                  handleInputChange('metadata', e.target.value);
                }
              }}
              rows={5}
              placeholder='{"key": "valor"}'
            />
            <p className="text-xs text-muted-foreground">
              Introduce un JSON válido para los metadatos de la organización.
            </p>
          </div>
          
          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-destructive/20">
            <div className="space-y-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <h3 className="text-lg font-medium text-destructive">Zona de peligro</h3>
              </div>
              
              <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Eliminar esta organización</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Esta acción eliminará todos los usuarios asociados y todos los datos de la organización. Esta operación no se puede deshacer.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente la organización &quot;{organization.name}&quot; 
                          y todos sus usuarios asociados. Se eliminarán también todos los datos relacionados con esta organización. 
                          Esta operación no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteOrganization}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Eliminar organización
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
