/**
 * Essential French localization utilities for client-side transformers
 * Simplified version for Single Raw-Data API architecture
 */

// French month mapping
export const FRENCH_MONTHS = {
	0: 'Janvier',
	1: 'Février', 
	2: 'Mars',
	3: 'Avril',
	4: 'Mai',
	5: 'Juin',
	6: 'Juillet',
	7: 'Août',
	8: 'Septembre',
	9: 'Octobre',
	10: 'Novembre',
	11: 'Décembre'
} as const

/**
 * Format date as DD/MM/YYYY
 */
export function formatDDMMYYYY(dateStr: string): string {
	const date = new Date(dateStr)
	const day = date.getDate().toString().padStart(2, '0')
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const year = date.getFullYear()
	return `${day}/${month}/${year}`
}

/**
 * Format date as "Février 2025" (French month + year)
 */
export function formatFrenchMonthYear(dateStr: string): string {
	const date = new Date(dateStr)
	const month = FRENCH_MONTHS[date.getMonth() as keyof typeof FRENCH_MONTHS]
	const year = date.getFullYear()
	return `${month} ${year}`
}

/**
 * Format currency in French format
 */
export function formatCurrencyFrench(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount)
}

/**
 * Format percentage in French format
 */
export function formatPercentageFrench(percentage: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(percentage / 100)
} 