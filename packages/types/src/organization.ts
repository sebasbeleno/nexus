export type Organization = {
	id: string
	name: string
	contact_email: string
	contact_phone: string
	status: string
	notes: string
	address: string
	logo_url: string
	created_at: string
	updated_at: string
	data_retention_period: number
	metadata: Record<string, any>
}

export type OrganizationStatus = "active" | "inactive" | "suspended"
