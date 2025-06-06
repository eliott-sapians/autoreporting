import type { PortfolioDataApiResponse } from '@/lib/types'

/**
 * Utility functions for data transformations
 */

/**
 * Format number as French currency string
 */
export function formatCurrency(amount: number | null): string {
	if (amount === null) return '0 €'
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount)
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number | null): string {
	if (value === null) return '0%'
	return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * Calculate portfolio performance based on fund data
 * This is a simplified calculation - may need refinement based on business logic
 */
export function calculatePortfolioPerformance(funds: NonNullable<PortfolioDataApiResponse['data']>['funds']): {
	performance: string
	performanceEur: string
} {
	if (!funds || funds.length === 0) {
		return { performance: '0%', performanceEur: '0 €' }
	}

	// Simple calculation: difference between valuation and book price
	let totalValuation = 0
	let totalBookPrice = 0
	
	funds.forEach((fund) => {
		if (fund.valuation_eur) totalValuation += fund.valuation_eur
		if (fund.book_price_eur) totalBookPrice += fund.book_price_eur
	})

	const performanceEur = totalValuation - totalBookPrice
	const performancePercent = totalBookPrice > 0 ? (performanceEur / totalBookPrice) * 100 : 0

	return {
		performance: formatPercentage(performancePercent),
		performanceEur: formatCurrency(performanceEur)
	}
}

/**
 * Calculate individual fund performance
 */
export function calculateFundPerformance(fund: NonNullable<PortfolioDataApiResponse['data']>['funds'][0]): {
	performance: string
	performanceEur: string
} {
	if (!fund.valuation_eur || !fund.book_price_eur) {
		return { performance: '0%', performanceEur: '0 €' }
	}

	const performanceEur = fund.valuation_eur - fund.book_price_eur
	const performancePercent = fund.book_price_eur > 0 ? (performanceEur / fund.book_price_eur) * 100 : 0

	return {
		performance: formatPercentage(performancePercent),
		performanceEur: formatCurrency(performanceEur)
	}
} 