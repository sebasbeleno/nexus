"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Copy, MoreHorizontal, Pencil, Trash2, Users, Eye } from "lucide-react"
import { toast } from "sonner"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Organization = {
    id: string
    name: string
    users: number
    status: string
    created_at: string
}

export const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        enableSorting: true,
        cell: ({ row }) => {
            const name = row.getValue("name") as string

            console.log(row)  

            return (
                <Link href={`/organizations/${encodeURIComponent(name)}`} className="hover:underline text-primary font-medium">
                    {name}
                </Link>
            )
        },
    },
    {
        accessorKey: "users",
        header: "Usuarios",
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            
            // Define variant based on status
            let variant: "default" | "outline" | "secondary" | "destructive" = "default"
            
            switch (status.toLowerCase()) {
                case "active":
                case "activo":
                    variant = "default"
                    break
                case "inactive":
                case "inactivo":
                    variant = "secondary"
                    break
                case "suspended":
                case "suspendido":
                    variant = "destructive"
                    break
                default:
                    variant = "outline"
            }
            
            const statusMap = {
                active: "Activo",
                inactive: "Inactivo",
                suspended: "Suspendido",
            }

            return <Badge variant={variant}>{statusMap[status.toLowerCase() as keyof typeof statusMap]}</Badge>   
        }
    },
    {
        accessorKey: "created_at",
        header: "Creado",
        enableSorting: true,
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString("es-ES")
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const organization = row.original

          const copyToClipboard = () => {
            navigator.clipboard.writeText(organization.id)
            toast.success("ID de organización copiado al portapapeles")
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copiar ID</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={`/organizations/${encodeURIComponent(organization.name)}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Ver organización</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/organizations/${encodeURIComponent(organization.name)}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar organización</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/organizations/${encodeURIComponent(organization.name)}/users`}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Ver usuarios</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => {
                    // Handle delete organization
                    // You might want to add a confirmation dialog here
                    toast.warning("Esta acción no está implementada aún")
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar organización</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
    },
]
