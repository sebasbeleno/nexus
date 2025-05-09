"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
}

interface UserProfileProps {
  profile: Profile
}

export function UserProfile({ profile }: UserProfileProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca"
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    } catch (e) {
      return "Fecha inválida"
    }
  }
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "analyst":
        return "Analista"
      default:
        return "Usuario"
    }
  }
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default" as const
      case "analyst":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Información del perfil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center justify-center md:justify-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ""} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-xl">{getInitials(profile.first_name, profile.last_name)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl font-bold tracking-tight">{profile.first_name} {profile.last_name}</h3>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant={getRoleBadgeVariant(profile.role)}>{getRoleLabel(profile.role)}</Badge>
                <Badge variant={profile.is_active ? "outline" : "destructive"}>
                  {profile.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            
            {profile.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">{profile.phone}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de registro</p>
              <p className="text-sm font-medium">{formatDate(profile.created_at)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Último acceso</p>
              <p className="text-sm font-medium">{formatDate(profile.last_login)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID de usuario</p>
              <p className="text-sm font-medium text-muted-foreground">{profile.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
