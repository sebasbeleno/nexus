"use client"

import { DataTable } from "../data-table"
import { toast } from "sonner"
import { columns } from "./columns"
import { useFetchUsers } from "@/hooks/use-fetch-users"
import { SearchInput } from "./search-input"
import { CreateUserDialog } from "./create-user-dialog"
import { useSearchParams } from "next/navigation"

export function UsersTable() {
  const searchParams = useSearchParams()
  const searchTerm = searchParams.get("search") || ""
  const { users, loading, error } = useFetchUsers(searchTerm)
  
  if (error) {
    toast("Error al cargar usuarios", {
      description: error.message,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {/* <SearchInput placeholder="Buscar por nombre, email o rol..." /> */}
        <CreateUserDialog />
      </div>
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={users || []}
          isLoading={loading}
        />
      </div>
    </div>
  )
}
