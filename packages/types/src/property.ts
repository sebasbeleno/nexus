export interface Property {
  id: string;
  address: string;
  property_type: PropertyType;
  location: any; // GeoJSON object
  official_boundary: any; // GeoJSON object
  metadata: Record<string, any> | null;
  creation_method: PropertyCreationMethod;
  created_at: string;
  updated_at: string;
}

export type PropertyCreationMethod =
    | 'client_provided'
    | 'surveyor_created'
    | 'admin_placeholder'
    | 'unknown';

export type PropertyType =
    | 'house'
    | 'apartment_building'
    | 'multi_floor_house'
    | 'commercial_building'
    | 'land'
    | 'other';