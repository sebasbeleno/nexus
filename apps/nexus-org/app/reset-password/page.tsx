'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/actions' // Assuming actions.ts is in the app root
import { Button } from '@workspace/ui/components/button' // Adjust path as needed
import { Input } from '@workspace/ui/components/input' // Adjust path as needed
import { Label } from '@workspace/ui/components/label' // Adjust path as needed
import { FormMessage } from '@/components/form-message'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { PasswordStrengthIndicator, getStrength, passwordRules } from '@/components/password-strength-indicator' // Import getStrength and passwordRules
import { Eye, EyeOff } from 'lucide-react' // Import icons for visibility toggle

export default function ResetPasswordPage() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false) // State for password visibility

	const fulfilledRules = passwordRules.filter(rule => rule.regex.test(password))
	const strength = getStrength(fulfilledRules.length)
	const isStrongEnough = strength.value >= 80 // 'Strong' or 'Very Strong'
	const passwordsMatch = password === confirmPassword && password !== ''

	const isSubmitDisabled = isLoading || !passwordsMatch || !isStrongEnough;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setSuccess(null)

		// These checks are now implicitly handled by the button's disabled state,
		// but kept here as a fallback or for more specific error messages if needed.
		if (!passwordsMatch) {
			setError('Passwords do not match or are empty.')
			return
		}
		if (!isStrongEnough) {
			setError('Password does not meet the strength requirements.')
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

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center ">
			<Card className="w-full max-w-md rounded-lg p-8 shadow-md">
				<CardHeader className='text-center'>
					<CardTitle className="text-xl">
						Cambia tu contraseña
					</CardTitle>
					<CardDescription>
						Por favor introduce tu nueva contraseña.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="relative"> {/* Added relative positioning */}
							<Label htmlFor="password">Nueva contraseña</Label>
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'} // Toggle type
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className="mt-1 pr-10" // Add padding for the icon
							/>
							<button
								type="button"
								onClick={togglePasswordVisibility}
								className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700" // Positioned button
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
							{/* Add the password strength indicator below the input */}
							<PasswordStrengthIndicator password={password} />
						</div>
						<div className="relative"> {/* Added relative positioning */}
							<Label htmlFor="confirmPassword">Confirmar contraseña</Label>
							<Input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'} // Toggle type
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								className="mt-1 pr-10" // Add padding for the icon
							/>
                             <button
								type="button"
								onClick={togglePasswordVisibility}
								className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700" // Positioned button
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
						</div>
						{error && <FormMessage message={error} type="error" />}
						{success && <FormMessage message={success} type="success" />}
						<Button type="submit" className="w-full" disabled={isSubmitDisabled}> {/* Updated disabled condition */}
							{isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
