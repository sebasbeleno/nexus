"use client"
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, User, X, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Schema for the main form
const formSchema = z.object({
  name: z.string().min(1, "Este campo es requerido"),
  contactEmail: z.string().email("Correo electrónico inválido"),
});

// Schema for admin user form
const adminSchema = z.object({
  email: z.string().email("Correo electrónico inválido").min(1, "Este campo es requerido"),
  name: z.string().min(1, "Este campo es requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

// Function to generate a secure password
const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest of the password
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export function CreateOrganizationSheet() {
  const supabase = createClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const [adminData, setAdminData] = useState<{ email?: string; name?: string; password?: string }>({});
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: adminData.email || "",
      name: adminData.name || "",
      password: generateSecurePassword()
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!adminData.email || !adminData.name || !adminData.password) {
      toast("Error",{
        description: "Debes crear un usuario administrador",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Create organization record
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            name: data.name,
            contact_email: data.contactEmail,
          }
        ])
        .select('id')
        .single();

      if (orgError) throw new Error(orgError.message);
        
      // Split admin name into first and last name
      const nameParts = adminData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Step 2: Create user in auth - IMPORTANT: This only creates the user, it does not sign them in
      // Use the provided password from adminData
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        user_metadata: {
          organization_id: orgData.id,
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
          consent_to_data_processing: true, 
        }
      });

      if (authError) {
        // If user auth creation fails, clean up the organization
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgData.id);
          
        throw new Error(authError.message);
      }
      
      if (!authData.user?.id) {
        // If no user ID returned, clean up the organization
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgData.id);
          
        throw new Error("No se pudo crear el usuario");
      }
  
      // Success - the current super_admin user remains logged in
      toast("Organización creada", {
        description: "La organización y el usuario administrador han sido creados exitosamente. Se ha enviado un correo al administrador para configurar su contraseña.",
      });
      
      reset();
      setAdminData({});
      setIsSheetOpen(false);
      router.refresh(); // Refresh the page to show the new organization
      
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast("Error",{
        description: error.message || "Hubo un problema al crear la organización",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = adminForm.handleSubmit((data) => {
    setAdminData({ email: data.email, name: data.name, password: data.password });
    setPopoverOpen(false); // Close the popover after successful submission
  });

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    adminForm.setValue('password', newPassword);
  };

  const copyPasswordToClipboard = () => {
    const password = adminForm.getValues('password');
    navigator.clipboard.writeText(password).then(() => {
      toast("Copiado", { description: "Contraseña copiada al portapapeles" });
    }).catch(err => {
      console.error('Error al copiar', err);
      toast("Error", { description: "No se pudo copiar la contraseña" });
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="default">Crear Organizacion</Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              Crear Organizacion
            </SheetTitle>
            <SheetDescription>
              Crear una nueva organizacion. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input 
                id="name" 
                className="col-span-3" 
                {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-sm col-span-3 col-start-2">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">
                Correo de contacto
              </Label>
              <Input 
                id="contactEmail" 
                className="col-span-3" 
                {...register("contactEmail")}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm col-span-3 col-start-2">{errors.contactEmail.message}</p>}
            </div>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <div className={`border flex items-center justify-center rounded-md cursor-pointer p-0 ${!adminData.email ? 'border-dashed' : ''}`}> 
                  {adminData.email ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-md w-full">
                      <Check size={16} className="text-green-500" />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{adminData.name}</p>
                        <p className="text-xs text-muted-foreground">{adminData.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 w-full">
                      <User size={16} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Crear usuario administrador</p>
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form onSubmit={handleAdminSubmit}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Crear usuario</h4>
                      <p className="text-sm text-muted-foreground">
                        Ingresa los datos del usuario administrador de la organizacion
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="adminEmail">Correo</Label>
                        <div className="col-span-2">
                          <Input
                            id="adminEmail"
                            className="h-8"
                            {...adminForm.register("email")}
                          />
                          {adminForm.formState.errors.email && (
                            <p className="text-red-500 text-xs mt-1">{adminForm.formState.errors.email.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="adminName">Nombre</Label>
                        <div className="col-span-2">
                          <Input
                            id="adminName"
                            className="h-8"
                            {...adminForm.register("name")}
                          />
                          {adminForm.formState.errors.name && (
                            <p className="text-red-500 text-xs mt-1">{adminForm.formState.errors.name.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="adminPassword">Contraseña</Label>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Input
                              id="adminPassword"
                              className="h-8"
                              type="text"
                              {...adminForm.register("password")}
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={handleGeneratePassword}
                              title="Generar nueva contraseña"
                            >
                              <RefreshCw size={16} />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={copyPasswordToClipboard}
                              title="Copiar contraseña"
                            >
                              <Copy size={16} />
                            </Button>
                          </div>
                          {adminForm.formState.errors.password && (
                            <p className="text-red-500 text-xs mt-1">{adminForm.formState.errors.password.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button type="submit" size="sm">Añadir usuario</Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </SheetClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
