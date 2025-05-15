'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/data-table';
import { columns } from './components/columns';
import { toast } from 'sonner';
import { getActiveProfilesByOrganization } from '@workspace/db/src/queries/profiles';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';
import { getUserOrganization } from '@workspace/db/queries/organizations';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: string;
  created_at: string;
  last_login: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No se pudo obtener información del usuario.');
        return;
      }
      
      // Get user's organization
      const { data: orgData, error: orgError } = await getUserOrganization(supabase, user.id);
      
      if (orgError || !orgData) {
        setError('No se pudo obtener información de la organización.');
        return;
      }
      
      setOrganizationId(orgData.id);
      
      // Get users for this organization
      const { data: usersData, error: usersError } = await getActiveProfilesByOrganization(
        supabase,
        orgData.id
      );
      
      if (usersError) {
        throw usersError;
      }
      
      const formattedUsers = (usersData || []).map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active || false,
        role: user.role || '',
        created_at: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
        last_login: user.last_login ? new Date(user.last_login).toISOString() : null
      })) as User[];
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
      toast.error('Error al cargar los usuarios', {
        description: 'No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);
  
  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTermLower) ||
      user.first_name.toLowerCase().includes(searchTermLower) ||
      user.last_name.toLowerCase().includes(searchTermLower) ||
      user.role.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="mt-2">{error}</p>
        <Button onClick={refreshUsers} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios de tu organización
          </p>
        </div>
       {/*  {organizationId && <CreateUserDialog organizationId={organizationId} onSuccess={refreshUsers} />} */}
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
      />
    </div>
  );
}
