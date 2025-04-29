import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

interface ContactTabProps {
  organization: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ContactTab({ organization, handleInputChange }: ContactTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Correo electrónico de contacto</Label>
              <Input 
                id="contact_email"
                type="email"
                value={organization.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contacto@organizacion.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono de contacto</Label>
              <Input 
                id="contact_phone"
                value={organization.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea 
              id="address"
              value={organization.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              placeholder="Calle, número, código postal, ciudad, país"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
