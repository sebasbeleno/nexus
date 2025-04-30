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

export function useFetchUsers() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
        
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
  }, [])
  
  return { users, loading, error }
}
