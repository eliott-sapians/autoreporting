/**
 * French localization utilities for portfolio data transformation
 * Provides date, currency, number, and text formatting for French locale
 */

/**
 * French month names mapping
 */
export const FRENCH_MONTHS = {
	1: 'Janvier',
	2: 'Février', 
	3: 'Mars',
	4: 'Avril',
	5: 'Mai',
	6: 'Juin',
	7: 'Juillet',
	8: 'Août',
	9: 'Septembre',
	10: 'Octobre',
	11: 'Novembre',
	12: 'Décembre'
} as const

/**
 * French month names (short form)
 */
export const FRENCH_MONTHS_SHORT = {
	1: 'Jan',
	2: 'Fév',
	3: 'Mar',
	4: 'Avr',
	5: 'Mai',
	6: 'Juin',
	7: 'Juil',
	8: 'Août',
	9: 'Sep',
	10: 'Oct',
	11: 'Nov',
	12: 'Déc'
} as const

/**
 * Format date to French month format (e.g., "Février 2025")
 */
export function formatDateToFrenchMonth(date: string | Date): string {
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date
		
		if (isNaN(dateObj.getTime())) {
			throw new Error('Invalid date')
		}
		
		const month = dateObj.getMonth() + 1 as keyof typeof FRENCH_MONTHS
		const year = dateObj.getFullYear()
		
		return `${FRENCH_MONTHS[month]} ${year}`
	} catch (error) {
		console.error('Error formatting date to French month:', error)
		return 'Date invalide'
	}
}

/**
 * Format date to full French format (e.g., "15 février 2025")
 */
export function formatDateToFrenchFull(date: string | Date): string {
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date
		
		if (isNaN(dateObj.getTime())) {
			throw new Error('Invalid date')
		}
		
		const day = dateObj.getDate()
		const month = dateObj.getMonth() + 1 as keyof typeof FRENCH_MONTHS
		const year = dateObj.getFullYear()
		
		return `${day} ${FRENCH_MONTHS[month].toLowerCase()} ${year}`
	} catch (error) {
		console.error('Error formatting date to French full:', error)
		return 'Date invalide'
	}
}

/**
 * Format currency for French locale
 */
export function formatCurrencyFrench(
	amount: number, 
	currency: string = 'EUR',
	options: {
		decimals?: number
		showSymbol?: boolean
		compact?: boolean
	} = {}
): string {
	const { decimals = 2, showSymbol = true, compact = false } = options
	
	try {
		if (isNaN(amount)) {
			return 'Montant invalide'
		}
		
		// Handle compact notation for large numbers
		if (compact && Math.abs(amount) >= 1000000) {
			const millions = amount / 1000000
			const formatted = formatNumberFrench(millions, { decimals: 1 })
			return showSymbol ? `${formatted} M€` : `${formatted} M`
		}
		
		if (compact && Math.abs(amount) >= 1000) {
			const thousands = amount / 1000
			const formatted = formatNumberFrench(thousands, { decimals: 1 })
			return showSymbol ? `${formatted} K€` : `${formatted} K`
		}
		
		const formatted = formatNumberFrench(amount, { decimals })
		
		if (!showSymbol) {
			return formatted
		}
		
		// Add currency symbol based on currency type
		switch (currency.toUpperCase()) {
			case 'EUR':
				return `${formatted} €`
			case 'USD':
				return `${formatted} $`
			case 'GBP':
				return `${formatted} £`
			default:
				return `${formatted} ${currency}`
		}
	} catch (error) {
		console.error('Error formatting currency:', error)
		return 'Erreur de format'
	}
}

/**
 * Format number for French locale
 */
export function formatNumberFrench(
	number: number,
	options: {
		decimals?: number
		thousandsSeparator?: string
		decimalSeparator?: string
	} = {}
): string {
	const { 
		decimals = 2, 
		thousandsSeparator = ' ', 
		decimalSeparator = ',' 
	} = options
	
	try {
		if (isNaN(number)) {
			return 'Nombre invalide'
		}
		
		// Round to specified decimal places
		const factor = Math.pow(10, decimals)
		const rounded = Math.round(number * factor) / factor
		
		// Split into integer and decimal parts
		const parts = rounded.toFixed(decimals).split('.')
		const integerPart = parts[0]
		const decimalPart = parts[1]
		
		// Add thousands separators to integer part
		const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
		
		// Combine parts
		if (decimals > 0 && decimalPart !== '00') {
			return `${formattedInteger}${decimalSeparator}${decimalPart}`
		}
		
		return formattedInteger
	} catch (error) {
		console.error('Error formatting number:', error)
		return 'Erreur de format'
	}
}

/**
 * Format percentage for French locale
 */
export function formatPercentageFrench(
	percentage: number,
	options: {
		decimals?: number
		showSymbol?: boolean
		showSign?: boolean
	} = {}
): string {
	const { decimals = 1, showSymbol = true, showSign = false } = options
	
	try {
		if (isNaN(percentage)) {
			return 'Pourcentage invalide'
		}
		
		const sign = showSign && percentage > 0 ? '+' : ''
		const formatted = formatNumberFrench(percentage, { decimals })
		return showSymbol ? `${sign}${formatted} %` : `${sign}${formatted}`
	} catch (error) {
		console.error('Error formatting percentage:', error)
		return 'Erreur de format'
	}
}

/**
 * Format performance with currency and percentage
 */
export function formatPerformanceFrench(
	performanceEur: number,
	performancePercentage: number,
	options: {
		currency?: string
		compact?: boolean
		showSign?: boolean
	} = {}
): {
	eur: string
	percentage: string
	combined: string
} {
	const { currency = 'EUR', compact = false, showSign = true } = options
	
	try {
		const eurFormatted = formatCurrencyFrench(performanceEur, currency, { 
			compact, 
			showSymbol: true 
		})
		
		const percentageFormatted = formatPercentageFrench(performancePercentage, { 
			decimals: 2, 
			showSign 
		})
		
		const sign = showSign && performanceEur > 0 ? '+' : ''
		const adjustedEur = showSign ? `${sign}${eurFormatted.replace(/^\+/, '')}` : eurFormatted
		
		return {
			eur: adjustedEur,
			percentage: percentageFormatted,
			combined: `${adjustedEur} (${percentageFormatted})`
		}
	} catch (error) {
		console.error('Error formatting performance:', error)
		return {
			eur: 'Erreur',
			percentage: 'Erreur',
			combined: 'Erreur de format'
		}
	}
}

/**
 * Normalize text values (trim whitespace, handle encoding)
 */
export function normalizeText(text: string | null | undefined): string {
	if (!text) {
		return ''
	}
	
	return text
		.trim()
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.replace(/[""]/g, '"') // Normalize quote marks
		.replace(/['']/g, "'") // Normalize apostrophes
}

/**
 * Clean and format ISIN codes
 */
export function formatISIN(isin: string | null | undefined): string {
	if (!isin) {
		return ''
	}
	
	const cleaned = isin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
	
	// Validate ISIN format (2 letters + 10 alphanumeric)
	if (cleaned.length === 12 && /^[A-Z]{2}[A-Z0-9]{10}$/.test(cleaned)) {
		return cleaned
	}
	
	return isin.trim() // Return original if doesn't match ISIN format
}

/**
 * Text transformation helpers
 */
export const textTransformers = {
	/**
	 * Convert strategy names to display format
	 */
	strategyToDisplay: (strategy: string): string => {
		const strategyMap: Record<string, string> = {
			'cash': 'Liquidités',
			'obligations': 'Obligations',
			'monetaire': 'Monétaire',
			'actions': 'Actions',
			'immobilier': 'Immobilier',
			'alternatif': 'Alternatif',
			'diversifie': 'Diversifié'
		}
		
		const normalized = strategy.toLowerCase().trim()
		return strategyMap[normalized] || strategy
	},
	
	/**
	 * Convert bucket names to display format
	 */
	bucketToDisplay: (bucket: string): string => {
		const bucketMap: Record<string, string> = {
			'liquide': 'Poche Liquide',
			'illiquide': 'Poche Illiquide', 
			'provision': 'Poche Provision',
			'long-terme': 'Long Terme',
			'court-terme': 'Court Terme'
		}
		
		const normalized = bucket.toLowerCase().trim()
		return bucketMap[normalized] || bucket
	},
	
	/**
	 * Convert currency codes to display format
	 */
	currencyToDisplay: (currency: string): string => {
		const currencyMap: Record<string, string> = {
			'EUR': 'Euro',
			'USD': 'Dollar américain',
			'GBP': 'Livre sterling',
			'CHF': 'Franc suisse',
			'JPY': 'Yen japonais'
		}
		
		const normalized = currency.toUpperCase().trim()
		return currencyMap[normalized] || currency
	}
}

/**
 * Date utilities
 */
export const dateUtils = {
	/**
	 * Check if date string is valid
	 */
	isValidDate: (dateString: string): boolean => {
		const date = new Date(dateString)
		return !isNaN(date.getTime())
	},
	
	/**
	 * Convert various date formats to ISO string
	 */
	toISOString: (dateInput: string | Date): string => {
		try {
			const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
			return date.toISOString()
		} catch (error) {
			console.error('Error converting date to ISO string:', error)
			return new Date().toISOString()
		}
	},
	
	/**
	 * Get relative time in French (e.g., "il y a 2 heures")
	 */
	getRelativeTime: (date: string | Date): string => {
		try {
			const now = new Date()
			const dateObj = typeof date === 'string' ? new Date(date) : date
			const diffMs = now.getTime() - dateObj.getTime()
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
			
			if (diffDays === 0) {
				return "aujourd'hui"
			} else if (diffDays === 1) {
				return 'hier'
			} else if (diffDays < 7) {
				return `il y a ${diffDays} jours`
			} else if (diffDays < 30) {
				const weeks = Math.floor(diffDays / 7)
				return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
			} else {
				const months = Math.floor(diffDays / 30)
				return `il y a ${months} mois`
			}
		} catch (error) {
			console.error('Error calculating relative time:', error)
			return 'Date inconnue'
		}
	}
} 