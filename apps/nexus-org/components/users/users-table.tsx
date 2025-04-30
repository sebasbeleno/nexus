"use client"

import { DataTable } from "../data-table"
import { toast } from "sonner"
import { columns } from "./columns"
import { useFetchUsers } from "@/hooks/use-fetch-users"

export function UsersTable() {
  const { users, loading, error } = useFetchUsers()
  
  if (error) {
    toast("Error al cargar usuarios", {
      description: error.message,
    })
  }

  return (
    <div className="space-y-4">
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
