'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/actions' // Assuming actions.ts is in the app root
import { Button } from '@workspace/ui/components/button' // Adjust path as needed
import { Input } from '@workspace/ui/components/input' // Adjust path as needed
import { Label } from '@workspace/ui/components/label' // Adjust path as needed
import { FormMessage } from '@/components/form-message'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

export default function ResetPasswordPage() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setSuccess(null)

		if (password !== confirmPassword) {
			setError('Passwords do not match.')
			return
		}

		if (password.length < 6) {
			// Add more robust password validation as needed
			setError('Password must be at least 6 characters long.')
			return
		}

		setIsLoading(true)

		try {
			const result = await updatePassword(password)
			if (result?.error) { // Check if result exists and has an error property
				setError(result.error)
			} else {
				// Success message can be shown briefly, but redirect is handled by server action
				setSuccess('Password updated successfully! Redirecting...')
				// No explicit router.push needed here.
			}
		} catch (err) {
			console.error('Password update failed:', err)
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center ">
			<Card className="w-full max-w-md rounded-lg p-8 shadow-md">
				<CardHeader className='text-center'>
					<CardTitle className="text-xl">
						Reset Password
					</CardTitle>
					<CardDescription>
						Please enter your new password below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								className="mt-1"
							/>
						</div>
						{error && <FormMessage message={error} type="error" />}
						{success && <FormMessage message={success} type="success" />}
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Updating...' : 'Update Password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
