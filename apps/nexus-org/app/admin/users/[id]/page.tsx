"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { getProfileById } from "@workspace/db/src/queries/profiles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { UserProfile } from "./components/user-profile"
import { UserEdit } from "./components/user-edit"

// Define the profile type based on what we expect from Supabase
interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  role: string
  created_at: string
  last_login: string | null
  phone?: string
  avatar_url?: string
  organization_id?: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { data, error } = await getProfileById(supabase, userId)
      
      if (error) {
        throw error
      }
      
      if (!data) {
        throw new Error("No se encontró el usuario solicitado")
      }
      
      setProfile({
        id: data.id,
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        is_active: data.is_active || false,
        role: data.role || "",
        created_at: data.created_at ? new Date(data.created_at).toISOString() : "",
        last_login: data.last_login ? new Date(data.last_login).toISOString() : null,
        phone: data.phone_number || "",
        avatar_url: data.avatar_url || "",
        organization_id: data.organization_id || ""
      })
    } catch (err: any) {
      console.error("Error fetching user profile:", err)
      setError(err.message || "Error al cargar los datos del usuario")
      toast.error("Error al cargar el usuario", {
        description: "No se pudieron cargar los datos del usuario. Por favor, intente de nuevo más tarde."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchUserProfile()
  }, [userId])
  
  const handleProfileUpdate = () => {
    toast.success("Perfil actualizado", {
      description: "Los datos del usuario han sido actualizados correctamente"
    })
    fetchUserProfile()
  }
  
  const handleGoBack = () => {
    router.push("/admin/users")
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando datos del usuario...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="mt-2">{error}</p>
        <div className="flex gap-4 justify-center mt-6">
          <Button onClick={fetchUserProfile}>
            Reintentar
          </Button>
          <Button variant="outline" onClick={handleGoBack}>
            Volver a la lista de usuarios
          </Button>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Usuario no encontrado</h2>
        <p className="mt-2">No se pudo encontrar el usuario solicitado</p>
        <Button onClick={handleGoBack} className="mt-4">
          Volver a la lista de usuarios
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detalles y administración del usuario
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="edit">Editar</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <UserProfile profile={profile} />
        </TabsContent>
        <TabsContent value="edit" className="mt-4">
          <UserEdit 
            profile={profile} 
            onProfileUpdate={handleProfileUpdate} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
