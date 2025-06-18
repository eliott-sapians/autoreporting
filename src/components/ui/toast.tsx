'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'destructive'
	className?: string
	children: React.ReactNode
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
	({ className, variant = 'default', children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'fixed top-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg',
					variant === 'destructive'
						? 'border-red-200 bg-red-50 text-red-900'
						: 'border-gray-200 bg-white text-gray-900',
					className
				)}
				{...props}
			>
				{children}
			</div>
		)
	}
)
Toast.displayName = 'Toast'

// Simple toast context
interface ToastContextType {
	toast: (message: string, variant?: 'default' | 'destructive') => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; variant: 'default' | 'destructive' }>>([])

	const toast = React.useCallback((message: string, variant: 'default' | 'destructive' = 'default') => {
		const id = Date.now().toString()
		setToasts(prev => [...prev, { id, message, variant }])

		// Auto remove after 4 seconds
		setTimeout(() => {
			setToasts(prev => prev.filter(t => t.id !== id))
		}, 4000)
	}, [])

	const removeToast = React.useCallback((id: string) => {
		setToasts(prev => prev.filter(t => t.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			{toasts.map(({ id, message, variant }) => (
				<Toast
					key={id}
					variant={variant}
					className="cursor-pointer"
					onClick={() => removeToast(id)}
				>
					{message}
				</Toast>
			))}
		</ToastContext.Provider>
	)
}

export function useToast() {
	const context = React.useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
} 