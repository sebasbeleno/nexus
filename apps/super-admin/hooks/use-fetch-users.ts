"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export type User = {
  id: string
  email: string
  first_name: string    
	last_name: string
  avatar_url: string | null
  role: string
  created_at: string
  last_login: string | null
  is_active: boolean
}

export function useFetchUsers(searchTerm?: string) {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        let query = supabase.from('profiles').select('*')
        
        if (searchTerm) {
          // Search in email, first_name, last_name, or role fields
          query = query.or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`
          )
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch users'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [searchTerm])
  
  return { users, loading, error }
}
