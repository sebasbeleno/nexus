import { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { UsersTable } from "@/components/users/users-table"

export const metadata: Metadata = {
  title: "Usuarios",
  description: "Gestionar usuarios en el sistema",
}

export default async function UsersPage() {
  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <PageHeader heading="Usuarios" text="Gestionar todos los usuarios en el sistema." />
      <UsersTable />
    </div>
  )
}
