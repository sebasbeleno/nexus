'use client'

import React from 'react'
import { cn } from "@workspace/ui/lib/utils"
import { Progress } from '@workspace/ui/components/progress'
import { CheckCircle, XCircle } from 'lucide-react' // Using lucide-react icons

interface PasswordRule {
	id: string
	text: string
	regex: RegExp
}

export const passwordRules: PasswordRule[] = [ // Export passwordRules
	{ id: 'length', text: '8 caracteres como mínimo', regex: /.{8,}/ },
	{ id: 'uppercase', text: 'Contiene una letra mayúscula', regex: /[A-Z]/ },
	{ id: 'lowercase', text: 'Contiene una letra minúscula', regex: /[a-z]/ },
	{ id: 'number', text: 'Contiene un número', regex: /[0-9]/ },
	{ id: 'special', text: 'Contiene un carácter especial (!@#$%^&*)', regex: /[!@?#$%^&*]/ },
]

interface PasswordStrengthIndicatorProps {
	password: string
}

export const getStrength = (rulesMet: number): { level: string; value: number; color: string } => { // Export getStrength
	switch (rulesMet) {
		case 0:
		case 1:
			return { level: 'Muy débil', value: 20, color: 'bg-red-500' }
		case 2:
			return { level: 'Débil', value: 40, color: 'bg-orange-500' }
		case 3:
			return { level: 'Buena', value: 60, color: 'bg-yellow-500' }
		case 4:
			return { level: 'Fuerte', value: 80, color: 'bg-green-500' }
		case 5:
			return { level: 'Muy Fuerte', value: 100, color: 'bg-emerald-500' }
		default:
			return { level: 'Muy débil', value: 0, color: 'bg-red-500' }
	}
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
	const fulfilledRules = passwordRules.filter(rule => rule.regex.test(password))
	const strength = getStrength(fulfilledRules.length)

	if (!password) {
		return null // Don't show indicator if password is empty
	}

	return (
		<div className="mt-2 space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span>Seguridad de la contraseña</span>
				<span className={cn('font-medium', {
					'text-red-500': strength.level === 'Muy débil',
					'text-orange-500': strength.level === 'Débil',
					'text-yellow-500': strength.level === 'Buena',
					'text-green-500': strength.level === 'Fuerte',
					'text-emerald-500': strength.level === 'Muy Fuerte',
				})}>
					{strength.level}
				</span>
			</div>
			<Progress value={strength.value} className="h-2" />
			<ul className="space-y-1 text-xs text-muted-foreground">
				{passwordRules.map(rule => {
					const isMet = fulfilledRules.some(fr => fr.id === rule.id)
					return (
						<li key={rule.id} className={cn('flex items-center', { 'text-green-600': isMet } )}>
							{isMet ? (
								<CheckCircle className="mr-2 h-3 w-3" />
							) : (
								<XCircle className="mr-2 h-3 w-3" />
							)}
							{rule.text}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
