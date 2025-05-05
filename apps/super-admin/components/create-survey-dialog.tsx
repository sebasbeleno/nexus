'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClient } from "@/utils/supabase/client";

import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea' // Assuming Textarea exists

// Define Zod schema for validation
const surveySchema = z.object({
  name: z.string().min(3, { message: 'Survey name must be at least 3 characters long.' }),
  description: z.string().optional(),
  // Add other fields like structure, deadline later if needed
})

type SurveyFormData = z.infer<typeof surveySchema>

interface CreateSurveyDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSurveyCreated: () => void // Callback to refresh survey list
}

export function CreateSurveyDialog({ projectId, open, onOpenChange, onSurveyCreated }: CreateSurveyDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const supabase = createClient()

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function onSubmit(values: SurveyFormData) {
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert([
          {
            project_id: projectId,
            name: values.name,
            description: values.description,
            structure: {}, // Default empty structure for now
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Survey created:', data)
      form.reset()
      onSurveyCreated() // Refresh the list on the parent page
      onOpenChange(false) // Close the dialog
    } catch (error) {
      console.error('Failed to create survey:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Crear nueva encuesta
          </DialogTitle>
          <DialogDescription>
            Complete los siguientes campos para crear una nueva encuesta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre de la encuesta
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Vivienda social 2025-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descripción (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ejemplo: Encuesta sobre vivienda social en la región de X"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add fields for structure, deadline, metadata later */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isSubmitting ? 'Creando...' : 'Crear encuesta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
