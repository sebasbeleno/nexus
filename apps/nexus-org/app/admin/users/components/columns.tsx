"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { format } from "date-fns"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

// Define the user type for columns
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  role: string
  created_at: string
  last_login: string | null
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string
      const lastName = row.getValue("last_name") as string
      const userId = row.original.id
      
      return (
        <a 
          href={`/admin/users/${userId}`} 
          className="hover:underline text-primary font-medium cursor-pointer"
        >
          {firstName} {lastName}
        </a>
      )
    },
  },
  {
    accessorKey: "last_name",
    header: "Apellido",
    enableHiding: true,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo electrónico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rol
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      let label = "Usuario"
      let variant = "outline" as "outline" | "default" | "destructive" | "secondary"

      switch (role) {
        case "admin":
          label = "Administrador"
          variant = "default"
          break
        case "analyst":
          label = "Analista"
          variant = "secondary"
          break
      }

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      const formattedDate = date ? new Date(date).toLocaleDateString('es-ES') : ""
      return <div>{formattedDate}</div>
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "last_login",
    header: "Último acceso",
    cell: ({ row }) => {
      const lastLogin = row.getValue("last_login") as string | null
      if (!lastLogin) return <span className="text-muted-foreground">Nunca</span>
      
      return <div>{new Date(lastLogin).toLocaleString('es-ES')}</div>
    },
  },
]
