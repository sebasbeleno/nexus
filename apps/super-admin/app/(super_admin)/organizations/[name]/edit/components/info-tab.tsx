import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { ClipboardList } from "lucide-react";

interface InfoTabProps {
  organization: any;
  handleInputChange: (field: string, value: any) => void;
}

export function InfoTab({ organization, handleInputChange }: InfoTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la organización</Label>
              <Input 
                id="name"
                value={organization.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input 
                id="logo_url"
                value={organization.logo_url || ''}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Third Card for Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Notas de la organización
          </CardTitle>
          <CardDescription>
            Información adicional o comentarios sobre esta organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            id="notes"
            value={organization.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={5}
            placeholder="Añade notas o información importante sobre esta organización..."
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
