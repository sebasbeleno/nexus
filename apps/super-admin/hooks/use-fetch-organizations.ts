import { createClient } from '@/utils/supabase/client';
import { Organization } from '@workspace/types';
import { useState, useEffect } from 'react';

export function useFetchOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (supabaseError) throw supabaseError;
      setOrganizations(
        (data || []).map(org => ({
          id: org.id,
          name: org.name,
          contact_email: org.contact_email || '',
          contact_phone: org.contact_phone || '',
          status: org.status || 'inactive',
          notes: org.notes || '',
          created_at: new Date(org.created_at).toISOString(),
          updated_at: new Date(org.updated_at).toISOString(),
          address: org.address || '',
          logo_url: org.logo_url || '',
          data_retention_period: org.data_retention_period || 0,
          metadata: org.metadata || {},
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return { organizations, isLoading, error, refetch: fetchOrganizations };
}
