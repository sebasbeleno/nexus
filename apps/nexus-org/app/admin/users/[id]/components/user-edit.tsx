"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { updateProfile, updateUserRole, setUserActiveStatus } from "@workspace/db/src/queries/profiles"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  role: string
  phone?: string
  avatar_url?: string
}

interface UserEditProps {
  profile: Profile
  onProfileUpdate: () => void
}

const userFormSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  phone: z.string().optional(),
  role: z.string().min(1, "El rol es requerido"),
  is_active: z.boolean()
})

type UserFormValues = z.infer<typeof userFormSchema>

export function UserEdit({ profile, onProfileUpdate }: UserEditProps) {
  const [formValues, setFormValues] = useState<UserFormValues>({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone || "",
    role: profile.role,
    is_active: profile.is_active
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  
  const handleFormChange = (field: keyof UserFormValues, value: string | boolean) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }
  
  const validateForm = (): boolean => {
    try {
      userFormSchema.parse(formValues)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setFormErrors(newErrors)
      }
      return false
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      
      // Update basic profile information
      const { error: profileError } = await updateProfile(supabase, profile.id, {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        phone_number: formValues.phone
      })
      
      if (profileError) {
        throw profileError
      }
      
      // Update role if changed
      if (formValues.role !== profile.role) {
        const { error: roleError } = await updateUserRole(
          supabase, 
          profile.id, 
          formValues.role as any
        )
        
        if (roleError) {
          throw roleError
        }
      }
      
      // Update active status if changed
      if (formValues.is_active !== profile.is_active) {
        const { error: statusError } = await setUserActiveStatus(
          supabase,
          profile.id,
          formValues.is_active
        )
        
        if (statusError) {
          throw statusError
        }
      }
      
      // Notify parent component of successful update
      onProfileUpdate()
      
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast.error("Error al actualizar el usuario", {
        description: error.message || "No se pudo actualizar la información del usuario"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Editar información del usuario</CardTitle>
          <CardDescription>
            Actualiza los datos y la configuración del usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || ""} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback>{getInitials(profile.first_name, profile.last_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{profile.email}</p>
              <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input 
                id="first_name"
                value={formValues.first_name}
                onChange={(e) => handleFormChange("first_name", e.target.value)}
                className={formErrors.first_name ? "border-destructive" : ""}
              />
              {formErrors.first_name && (
                <p className="text-xs text-destructive">{formErrors.first_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input 
                id="last_name"
                value={formValues.last_name}
                onChange={(e) => handleFormChange("last_name", e.target.value)}
                className={formErrors.last_name ? "border-destructive" : ""}
              />
              {formErrors.last_name && (
                <p className="text-xs text-destructive">{formErrors.last_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone"
                value={formValues.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                placeholder="Opcional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={formValues.role} 
                onValueChange={(value) => handleFormChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="analyst">Analista</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-destructive">{formErrors.role}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active"
              checked={formValues.is_active}
              onCheckedChange={(checked) => handleFormChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Usuario activo</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
