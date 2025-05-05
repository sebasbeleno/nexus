"use client";

import { Property } from "@workspace/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface PropertiesTabProps {
  properties: Property[];
}

export function PropertiesTab({ properties }: PropertiesTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Propiedades Asociadas</CardTitle>
          <CardDescription>Propiedades relacionadas con esta encuesta</CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay propiedades asociadas a esta encuesta.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Dirección</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Método de Creación</th>
                    <th className="px-4 py-2 text-left">Fecha de Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{property.address}</td>
                      <td className="px-4 py-2">
                        {property.property_type === 'house' && 'Casa'}
                        {property.property_type === 'apartment_building' && 'Edificio de Apartamentos'}
                        {property.property_type === 'multi_floor_house' && 'Casa de Múltiples Pisos'}
                      </td>
                      <td className="px-4 py-2">
                        {property.creation_method === 'client_provided' && 'Proporcionado por Cliente'}
                        {property.creation_method === 'surveyor_created' && 'Creado por Encuestador'}
                        {property.creation_method === 'admin_placeholder' && 'Marcador de Posición'}
                        {property.creation_method === 'unknown' && 'Desconocido'}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(property.created_at).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
