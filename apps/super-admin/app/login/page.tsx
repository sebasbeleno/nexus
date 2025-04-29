import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LoginForm } from '@/components/login-form'

export default async function Login({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  const error = searchParams.error === 'access_denied'
    ? 'Invalid email or password'
    : searchParams.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <LoginForm error={error} />
    </div>
  )
}
