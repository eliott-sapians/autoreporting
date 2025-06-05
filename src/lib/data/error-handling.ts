/**
 * Error handling framework for data transformation failures
 * Provides structured error types, recovery mechanisms, and error reporting
 */

/**
 * Base error class for all data transformation errors
 */
export abstract class DataTransformationError extends Error {
	abstract readonly code: string
	abstract readonly severity: 'critical' | 'warning' | 'info'
	abstract readonly component: string
	abstract readonly retryable: boolean
	
	public readonly timestamp: Date
	public readonly context: Record<string, any>
	
	constructor(
		message: string, 
		context: Record<string, any> = {}
	) {
		super(message)
		this.name = this.constructor.name
		this.timestamp = new Date()
		this.context = context
		
		// Maintain proper stack trace for debugging
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
	
	/**
	 * Get error details for logging and reporting
	 */
	getDetails(): ErrorDetails {
		return {
			code: this.code,
			message: this.message,
			severity: this.severity,
			component: this.component,
			retryable: this.retryable,
			timestamp: this.timestamp,
			context: this.context,
			stack: this.stack
		}
	}
	
	/**
	 * Get user-friendly error message in French
	 */
	abstract getUserMessage(): string
	
	/**
	 * Get recovery suggestions
	 */
	abstract getRecoverySuggestions(): string[]
}

/**
 * Database connection and query errors
 */
export class DatabaseError extends DataTransformationError {
	readonly code = 'DB_ERROR'
	readonly severity = 'critical' as const
	readonly component = 'database'
	readonly retryable = true
	
	getUserMessage(): string {
		return 'Erreur de connexion à la base de données. Veuillez réessayer dans quelques instants.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Vérifiez votre connexion internet',
			'Réessayez dans quelques secondes', 
			'Contactez l\'administrateur si le problème persiste'
		]
	}
}

/**
 * Portfolio not found errors
 */
export class PortfolioNotFoundError extends DataTransformationError {
	readonly code = 'PORTFOLIO_NOT_FOUND'
	readonly severity = 'critical' as const
	readonly component = 'portfolio-service'
	readonly retryable = false
	
	getUserMessage(): string {
		return 'Portfolio introuvable. Veuillez vérifier l\'identifiant du portfolio.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Vérifiez l\'identifiant du portfolio',
			'Assurez-vous que le portfolio existe dans la base de données',
			'Contactez l\'administrateur pour vérifier les données'
		]
	}
}

/**
 * Data validation errors
 */
export class DataValidationError extends DataTransformationError {
	readonly code = 'DATA_VALIDATION_ERROR'
	readonly severity = 'warning' as const
	readonly component = 'data-validation'
	readonly retryable = false
	
	getUserMessage(): string {
		return 'Données invalides détectées. Certaines informations peuvent être incorrectes.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Vérifiez la source des données',
			'Contactez l\'équipe de gestion des données',
			'Consultez les détails de l\'erreur pour plus d\'informations'
		]
	}
}

/**
 * Chart data transformation errors
 */
export class ChartDataError extends DataTransformationError {
	readonly code = 'CHART_DATA_ERROR'
	readonly severity = 'warning' as const
	readonly component = 'chart-transformation'
	readonly retryable = true
	
	getUserMessage(): string {
		return 'Erreur lors de la préparation des données pour les graphiques.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Vérifiez les données du portfolio',
			'Réessayez de charger la page',
			'Contactez le support si le problème persiste'
		]
	}
}

/**
 * Performance calculation errors
 */
export class PerformanceCalculationError extends DataTransformationError {
	readonly code = 'PERFORMANCE_CALC_ERROR'
	readonly severity = 'info' as const
	readonly component = 'performance-calculator'
	readonly retryable = true
	
	getUserMessage(): string {
		return 'Impossible de calculer les performances. Les données de base restent disponibles.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Les performances seront calculées lors de la prochaine mise à jour',
			'Vérifiez si des données historiques sont disponibles',
			'Contactez l\'équipe de gestion des données'
		]
	}
}

/**
 * Cache errors
 */
export class CacheError extends DataTransformationError {
	readonly code = 'CACHE_ERROR'
	readonly severity = 'info' as const
	readonly component = 'cache-system'
	readonly retryable = true
	
	getUserMessage(): string {
		return 'Erreur du système de cache. Les données sont récupérées directement.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Le cache sera rétabli automatiquement',
			'Les performances peuvent être temporairement réduites',
			'Aucune action requise de votre part'
		]
	}
}

/**
 * Error details interface
 */
export interface ErrorDetails {
	code: string
	message: string
	severity: 'critical' | 'warning' | 'info'
	component: string
	retryable: boolean
	timestamp: Date
	context: Record<string, any>
	stack?: string
}

/**
 * Error recovery result
 */
export interface RecoveryResult {
	success: boolean
	data?: any
	newError?: DataTransformationError
	retryAfter?: number // milliseconds
}

/**
 * Error handler class for managing transformation errors
 */
export class ErrorHandler {
	private static instance: ErrorHandler
	private errorLog: ErrorDetails[] = []
	private maxLogSize = 1000
	
	public static getInstance(): ErrorHandler {
		if (!ErrorHandler.instance) {
			ErrorHandler.instance = new ErrorHandler()
		}
		return ErrorHandler.instance
	}
	
	/**
	 * Handle and log an error
	 */
	handleError(error: Error | DataTransformationError, context: Record<string, any> = {}): ErrorDetails {
		let transformationError: DataTransformationError
		
		if (error instanceof DataTransformationError) {
			transformationError = error
		} else {
			// Wrap generic errors in a transformation error
			transformationError = new GenericTransformationError(error.message, {
				...context,
				originalError: error.name,
				originalStack: error.stack
			})
		}
		
		const errorDetails = transformationError.getDetails()
		this.logError(errorDetails)
		
		// Report critical errors
		if (errorDetails.severity === 'critical') {
			this.reportCriticalError(errorDetails)
		}
		
		return errorDetails
	}
	
	/**
	 * Attempt to recover from an error
	 */
	async attemptRecovery(
		error: DataTransformationError, 
		retryFunction: () => Promise<any>,
		maxRetries: number = 3
	): Promise<RecoveryResult> {
		if (!error.retryable) {
			return { success: false, newError: error }
		}
		
		let retryCount = 0
		let lastError = error
		
		while (retryCount < maxRetries) {
			try {
				// Exponential backoff
				const delay = Math.pow(2, retryCount) * 1000
				await new Promise(resolve => setTimeout(resolve, delay))
				
				const data = await retryFunction()
				return { success: true, data }
			} catch (retryError: any) {
				retryCount++
				lastError = retryError instanceof DataTransformationError 
					? retryError 
					: new GenericTransformationError(
						`Retry ${retryCount} failed: ${retryError?.message || 'Unknown error'}`,
						{ originalError: retryError }
					)
			}
		}
		
		return { 
			success: false, 
			newError: lastError,
			retryAfter: Math.pow(2, maxRetries) * 1000
		}
	}
	
	/**
	 * Get error statistics
	 */
	getErrorStatistics(): {
		total: number
		bySeverity: Record<string, number>
		byComponent: Record<string, number>
		recent: ErrorDetails[]
	} {
		const bySeverity: Record<string, number> = {}
		const byComponent: Record<string, number> = {}
		
		this.errorLog.forEach(error => {
			bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
			byComponent[error.component] = (byComponent[error.component] || 0) + 1
		})
		
		// Get recent errors (last 10)
		const recent = this.errorLog.slice(-10)
		
		return {
			total: this.errorLog.length,
			bySeverity,
			byComponent,
			recent
		}
	}
	
	/**
	 * Clear error log
	 */
	clearErrorLog(): void {
		this.errorLog = []
	}
	
	private logError(errorDetails: ErrorDetails): void {
		this.errorLog.push(errorDetails)
		
		// Trim log if it gets too large
		if (this.errorLog.length > this.maxLogSize) {
			this.errorLog = this.errorLog.slice(-this.maxLogSize)
		}
		
		// Console logging based on severity
		switch (errorDetails.severity) {
			case 'critical':
				console.error('CRITICAL ERROR:', errorDetails)
				break
			case 'warning':
				console.warn('WARNING:', errorDetails)
				break
			case 'info':
				console.info('INFO:', errorDetails)
				break
		}
	}
	
	private reportCriticalError(errorDetails: ErrorDetails): void {
		// In a real application, this would send to an error reporting service
		// like Sentry, Bugsnag, or custom logging service
		console.error('CRITICAL ERROR REPORTED:', {
			code: errorDetails.code,
			message: errorDetails.message,
			component: errorDetails.component,
			timestamp: errorDetails.timestamp,
			context: errorDetails.context
		})
	}
}

/**
 * Generic transformation error for wrapping unknown errors
 */
class GenericTransformationError extends DataTransformationError {
	readonly code = 'GENERIC_ERROR'
	readonly severity = 'warning' as const
	readonly component = 'unknown'
	readonly retryable = true
	
	getUserMessage(): string {
		return 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
	}
	
	getRecoverySuggestions(): string[] {
		return [
			'Rafraîchissez la page',
			'Réessayez dans quelques instants',
			'Contactez le support si le problème persiste'
		]
	}
}

/**
 * Error handling utilities
 */
export const errorUtils = {
	/**
	 * Create a safe async wrapper that handles errors
	 */
	safeAsync: <T>(
		asyncFunction: () => Promise<T>,
		fallbackValue: T,
		context: Record<string, any> = {}
	) => {
		return async (): Promise<T> => {
			try {
				return await asyncFunction()
			} catch (error) {
				const errorHandler = ErrorHandler.getInstance()
				errorHandler.handleError(error as Error, context)
				return fallbackValue
			}
		}
	},
	
	/**
	 * Create error boundary wrapper for React components
	 */
	createErrorBoundary: (componentName: string) => {
		return (error: Error, errorInfo: any) => {
			const errorHandler = ErrorHandler.getInstance()
			errorHandler.handleError(error, {
				component: componentName,
				errorInfo
			})
		}
	},
	
	/**
	 * Validate data and throw appropriate errors
	 */
	validateData: (data: any, validation: (data: any) => boolean, errorMessage: string) => {
		if (!validation(data)) {
			throw new DataValidationError(errorMessage, { invalidData: data })
		}
	}
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = ErrorHandler.getInstance() 