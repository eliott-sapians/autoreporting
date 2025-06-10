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
 * Formula: (valuation / (valuation - pnl)) - 1
 */
export function calculatePortfolioPerformance(funds: NonNullable<PortfolioDataApiResponse['data']>['funds']): {
	performance: string
	performanceEur: string
} {
	if (!funds || funds.length === 0) {
		return { performance: '0%', performanceEur: '0 €' }
	}

	let totalValuation = 0
	let totalPnl = 0
	
	funds.forEach((fund) => {
		if (fund.valuation_eur) totalValuation += fund.valuation_eur
		if (fund.pnl_eur) totalPnl += fund.pnl_eur
	})

	// Performance calculation: (valuation / (valuation - pnl)) - 1
	const costBasis = totalValuation - totalPnl
	const performancePercent = costBasis > 0 ? ((totalValuation / costBasis) - 1) * 100 : 0
	
	return {
		performance: formatPercentage(performancePercent),
		performanceEur: formatCurrency(totalPnl) // PnL in EUR is the absolute performance
	}
}

/**
 * Calculate individual fund performance
 * Formula: (valuation / (valuation - pnl)) - 1
 */
export function calculateFundPerformance(fund: NonNullable<PortfolioDataApiResponse['data']>['funds'][0]): {
	performance: string
	performanceEur: string
} {
	if (!fund.valuation_eur) {
		return { performance: '0%', performanceEur: '0 €' }
	}

	// If no PnL data, assume no performance
	const pnl = fund.pnl_eur || 0
	const costBasis = fund.valuation_eur - pnl
	
	// Performance calculation: (valuation / (valuation - pnl)) - 1
	const performancePercent = costBasis > 0 ? ((fund.valuation_eur / costBasis) - 1) * 100 : 0

	return {
		performance: formatPercentage(performancePercent),
		performanceEur: formatCurrency(pnl) // PnL in EUR is the absolute performance
	}
} 