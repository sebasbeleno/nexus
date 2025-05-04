"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { CopyIcon, RefreshCwIcon } from "lucide-react";

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

export function CreateOrganizationDialog() {
  const supabase = createClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const [adminData, setAdminData] = useState<{ email?: string; name?: string; password?: string }>({});
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Renamed state variable

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
        email_confirm: true,
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
      setIsDialogOpen(false); // Use renamed state variable
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
    console.log("Admin Data:", data);
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}> {/* Use Dialog and renamed state */}
      <DialogTrigger asChild>
        <Button variant="default">Crear Organizacion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]"> {/* Use DialogContent */}
        <DialogHeader>
          <DialogTitle>Crear Nueva Organización</DialogTitle>
          <DialogDescription>
            Completa los detalles de la organización y crea un usuario administrador inicial.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Organization Details */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Nombre de la Organización
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="col-span-3"
              disabled={isLoading}
            />
            {errors.name && <p className="col-span-4 text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactEmail" className="text-right">
              Email Contacto
            </Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              className="col-span-3"
              disabled={isLoading}
            />
            {errors.contactEmail && <p className="col-span-4 text-red-500 text-sm">{errors.contactEmail.message}</p>}
          </div>

          {/* Admin User Popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                {adminData.email ? `Admin: ${adminData.email}` : "Crear Usuario Administrador"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form onSubmit={handleAdminSubmit} className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Administrador</h4>
                  <p className="text-sm text-muted-foreground">
                    Define los datos del usuario administrador.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-name">Nombre Completo</Label>
                  <Input
                    id="admin-name"
                    {...adminForm.register("name")}
                    disabled={isLoading}
                  />
                  {adminForm.formState.errors.name && <p className="text-red-500 text-sm">{adminForm.formState.errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    {...adminForm.register("email")}
                    disabled={isLoading}
                  />
                  {adminForm.formState.errors.email && <p className="text-red-500 text-sm">{adminForm.formState.errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="admin-password"
                      type="text"
                      {...adminForm.register("password")}
                      disabled={isLoading}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={handleGeneratePassword} disabled={isLoading}>
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={copyPasswordToClipboard} disabled={isLoading}>
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {adminForm.formState.errors.password && <p className="text-red-500 text-sm">{adminForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading}>Guardar Administrador</Button>
              </form>
            </PopoverContent>
          </Popover>
          
          {/* Display admin data if set */}
          {adminData.email && (
            <div className="text-sm text-muted-foreground mt-2 p-2 border rounded">
              <p><strong>Admin Email:</strong> {adminData.email}</p>
              <p><strong>Admin Nombre:</strong> {adminData.name}</p>
              <p><strong>Admin Contraseña:</strong> ********** (Copiada)</p>
            </div>
          )}

        </form>
        <DialogFooter>
          <Button type="submit" form="create-organization-form" disabled={isLoading}> {/* Associate button with the outer form */}
            {isLoading ? "Creando..." : "Crear Organización"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
