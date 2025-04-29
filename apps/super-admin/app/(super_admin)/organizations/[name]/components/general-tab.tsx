import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Building2, Mail, Phone, MapPin, Calendar, ClipboardList, Image, Clock, Database, FileJson, Pencil } from "lucide-react";
import Link from "next/link";

export const GeneralTab = ({ organization }: { organization: any }) => (
  <div className="p-4 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Organization Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Información de la organización</CardTitle>
            <CardDescription>
              Detalles básicos sobre la organización
            </CardDescription>
          </div>
          <Link href={`/organizations/${encodeURIComponent(organization.name)}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar organización</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Building2 className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Nombre:</span>
                <span>{organization.name}</span>
              </div>
            </li>
            {organization.notes && (
              <li className="flex items-start">
                <ClipboardList className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Notas:</span>
                  <span>{organization.notes}</span>
                </div>
              </li>
            )}
            <li className="flex items-start">
              <Mail className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Email de contacto:</span>
                <span>{organization.contact_email || "No especificado"}</span>
              </div>
            </li>
            <li className="flex items-start">
              <Phone className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Teléfono de contacto:</span>
                <span>{organization.contact_phone || "No especificado"}</span>
              </div>
            </li>
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Dirección:</span>
                <span>{organization.address || "No especificada"}</span>
              </div>
            </li>
            <li className="flex items-start">
              <Image className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Logo URL:</span>
                <span>{organization.logo_url || "No especificado"}</span>
              </div>
            </li>
            <li className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Estado:</span>
                <span>{organization.status || "Inactivo"}</span>
              </div>
            </li>
            <li className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Fecha de creación:</span>
                <span>{new Date(organization.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            </li>
            <li className="flex items-start">
              <Database className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Periodo de retención de datos:</span>
                <span>{organization.data_retention_period || 365} días</span>
              </div>
            </li>
            {organization.metadata && Object.keys(organization.metadata).length > 0 && (
              <li className="flex items-start">
                <FileJson className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Metadatos:</span>
                  <span className="text-sm">{JSON.stringify(organization.metadata)}</span>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Second Card - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>
            Métricas relacionadas con esta organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 border rounded-lg border-dashed">
            <p className="text-muted-foreground text-center">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Third Card - Full Width */}
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
        <CardDescription>
          Historial de cambios y actividades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40 border rounded-lg border-dashed">
          <p className="text-muted-foreground text-center">
            La información de actividad estará disponible próximamente
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);
