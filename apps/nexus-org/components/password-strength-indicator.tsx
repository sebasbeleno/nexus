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

const passwordRules: PasswordRule[] = [
	{ id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
	{ id: 'uppercase', text: 'Contains an uppercase letter', regex: /[A-Z]/ },
	{ id: 'lowercase', text: 'Contains a lowercase letter', regex: /[a-z]/ },
	{ id: 'number', text: 'Contains a number', regex: /[0-9]/ },
	{ id: 'special', text: 'Contains a special character (!@#$%^&*)', regex: /[!@?#$%^&*]/ },
]

interface PasswordStrengthIndicatorProps {
	password: string
}

const getStrength = (rulesMet: number): { level: string; value: number; color: string } => {
	switch (rulesMet) {
		case 0:
		case 1:
			return { level: 'Very Weak', value: 20, color: 'bg-red-500' }
		case 2:
			return { level: 'Weak', value: 40, color: 'bg-orange-500' }
		case 3:
			return { level: 'Good', value: 60, color: 'bg-yellow-500' }
		case 4:
			return { level: 'Strong', value: 80, color: 'bg-green-500' }
		case 5:
			return { level: 'Very Strong', value: 100, color: 'bg-emerald-500' }
		default:
			return { level: 'Very Weak', value: 0, color: 'bg-red-500' }
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
				<span>Password Strength:</span>
				<span className={cn('font-medium', {
					'text-red-500': strength.level === 'Very Weak',
					'text-orange-500': strength.level === 'Weak',
					'text-yellow-500': strength.level === 'Good',
					'text-green-500': strength.level === 'Strong',
					'text-emerald-500': strength.level === 'Very Strong',
				})}>
					{strength.level}
				</span>
			</div>
			<Progress value={strength.value} className="h-2" indicatorClassName={strength.color} />
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
