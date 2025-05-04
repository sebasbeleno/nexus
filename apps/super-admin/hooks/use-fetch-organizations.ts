import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
}

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
        .select('id, name')
        .order('name');

      if (supabaseError) throw supabaseError;
      setOrganizations(data || []);
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
