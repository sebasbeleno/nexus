"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useState } from "react";
import { Loader2, ArrowLeft, Eye, EyeOff, RefreshCw, Copy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Define the form schema with validations
const userFormSchema = z.object({
  email: z.string().email({ message: "Debe ser un correo electrónico válido" }),
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  role: z.string().min(1, { message: "Debes seleccionar un rol" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function NewUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orgName = params.name as string;
  const supabase = createClient();
  
  // Generate a secure password
  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+=-";
    
    let password = "";
    // At least one of each character type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill the rest of the password
    for (let i = 0; i < 8; i++) {
      const allChars = lowercase + uppercase + numbers + symbols;
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    return password;
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Contraseña copiada al portapapeles");
      },
      (err) => {
        console.error('No se pudo copiar: ', err);
        toast.error("Error al copiar la contraseña");
      }
    );
  };
  
  // Initialize form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "analyst",
      password: generatePassword()
    }
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    
    try {
      // Step 1: Get the organization ID
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', decodeURIComponent(orgName))
        .single();
      
      if (orgError) throw new Error("No se pudo encontrar la organización");
      
      // Step 2: Create user with the generated password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          organization_id: orgData.id,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          is_active: true
        }
      });
      
      if (authError) throw new Error(authError.message);
      
      if (!authData.user?.id) {
        throw new Error("No se pudo crear el usuario");
      }
      
      toast.success("Usuario creado", {
        description: "El usuario ha sido creado exitosamente con la contraseña generada."
      });
      
      router.push(`/organizations/${orgName}/users`);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error("Error", {
        description: error.message || "Hubo un problema al crear el usuario"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to regenerate password and update form
  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue("password", newPassword);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href={`/organizations/${orgName}/users`} 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          Añadir Usuario
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Usuario</CardTitle>
          <CardDescription>
            Añade un nuevo usuario a la organización con una contraseña generada.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Generada</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <div className="relative flex-grow">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            {...field} 
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRegeneratePassword}
                        title="Generar nueva contraseña"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(form.getValues("password"))}
                        title="Copiar al portapapeles"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Esta contraseña se asignará al nuevo usuario. Asegúrate de compartirla de forma segura.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="analyst">Analista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El rol determina los permisos del usuario en la organización.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => router.push(`/organizations/${orgName}/users`)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
