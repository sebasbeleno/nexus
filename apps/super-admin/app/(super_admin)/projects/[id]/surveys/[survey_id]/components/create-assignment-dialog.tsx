"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { PlusCircle, AlertCircle, CalendarIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// Types
type Property = {
  id: string;
  name?: string;
  [key: string]: any;
};

type Surveyor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type Survey = {
  id: string;
  name?: string;
  version: number;
  [key: string]: any;
};

interface CreateAssignmentDialogProps {
  survey: Survey;
  properties: Property[];
  surveyors: Surveyor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof assignmentSchema>) => Promise<void>;
}

// Validation schema for assignment form
const assignmentSchema = z.object({
  surveyorId: z.string({
    required_error: "Por favor seleccione un encuestador",
  }),
  propertyId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export function CreateAssignmentDialog({ 
  survey, 
  properties, 
  surveyors, 
  open, 
  onOpenChange, 
  onSubmit 
}: CreateAssignmentDialogProps) {
  // Form setup
  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      surveyorId: "",
      propertyId: null,
      dueDate: null,
    },
  });

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Encuesta</DialogTitle>
          <DialogDescription>
            Asigne la encuesta "{survey.name || survey.id}" a un encuestador.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="surveyorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Encuestador</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar encuestador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {surveyors.length > 0 ? (
                        surveyors.map((surveyor) => (
                          <SelectItem key={surveyor.id} value={surveyor.id}>
                            {surveyor.first_name} {surveyor.last_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No hay encuestadores disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El encuestador que realizará la encuesta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propiedad (Opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar propiedad (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_property">Sin propiedad específica</SelectItem>
                      {properties.length > 0 ? (
                        properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name || `Propiedad ${property.id}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No hay propiedades disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Relaciona la asignación con una propiedad específica (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha límite (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha límite para completar la encuesta (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="h-4 w-4" />
              <p>La encuesta se asignará con la versión actual ({survey.version})</p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Asignar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
