import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
	return await updateSession(request)
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/admin/:path*',
		'/analyst/:path*',
		'/login/:path*',
	],
}
