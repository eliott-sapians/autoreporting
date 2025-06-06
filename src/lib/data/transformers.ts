import type { PortfolioDataApiResponse, FundData, TotalData, ProvisionData } from '@/lib/types'

/**
 * Data transformation utilities for converting raw portfolio data
 * into formats expected by slide components
 */

/**
 * Format number as French currency string
 */
function formatCurrency(amount: number | null): string {
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
function formatPercentage(value: number | null): string {
	if (value === null) return '0%'
	return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * Calculate portfolio performance based on fund data
 * This is a simplified calculation - may need refinement based on business logic
 */
function calculatePortfolioPerformance(funds: NonNullable<PortfolioDataApiResponse['data']>['funds']): {
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
function calculateFundPerformance(fund: NonNullable<PortfolioDataApiResponse['data']>['funds'][0]): {
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

/**
 * Transform raw portfolio data into TotalData format
 */
export function transformToTotalData(apiResponse: PortfolioDataApiResponse): TotalData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const funds = apiResponse.data.funds
	
	// Calculate total valuation
	const totalValuation = funds.reduce((sum, fund) => {
		return sum + (fund.valuation_eur || 0)
	}, 0)

	// Calculate performance
	const { performance, performanceEur } = calculatePortfolioPerformance(funds)

	return {
		total: formatCurrency(totalValuation),
		performance,
		performanceEur
	}
}

/**
 * Transform raw portfolio data into FundData array
 */
export function transformToFundData(apiResponse: PortfolioDataApiResponse): FundData[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds

	return funds.map(fund => {
		const { performance, performanceEur } = calculateFundPerformance(fund)
		
		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			strategy: fund.strategy || 'Unknown',
			valuation: formatCurrency(fund.valuation_eur),
			performance,
			performanceEur
		}
	})
}

/**
 * Transform raw portfolio data into complete ProvisionData format
 */
export function transformToProvisionData(apiResponse: PortfolioDataApiResponse): ProvisionData | null {
	const totalData = transformToTotalData(apiResponse)
	const fundData = transformToFundData(apiResponse)

	if (!totalData) {
		return null
	}

	return {
		funds: fundData,
		total: totalData
	}
}

/**
 * Filter funds by strategy for allocation charts
 */
export function getFundsByStrategy(apiResponse: PortfolioDataApiResponse, strategy?: string): FundData[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const allFunds = transformToFundData(apiResponse)
	
	if (!strategy) {
		return allFunds
	}

	return allFunds.filter(fund => fund.strategy === strategy)
}

/**
 * Get strategy allocation data for pie charts
 */
export function getStrategyAllocation(apiResponse: PortfolioDataApiResponse): Array<{
	name: string
	value: number
	color: string
}> {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds
	
	// Group by strategy
	const strategyTotals = funds.reduce((acc, fund) => {
		const strategy = fund.strategy || 'Unknown'
		const valuation = fund.valuation_eur || 0
		
		if (!acc[strategy]) {
			acc[strategy] = 0
		}
		acc[strategy] += valuation
		
		return acc
	}, {} as Record<string, number>)

	// Default strategy colors
	const strategyColors: Record<string, string> = {
		'Cash': '#3b82f6',
		'Obligations': '#10b981',
		'Monétaire': '#f59e0b',
		'Unknown': '#6b7280'
	}

	return Object.entries(strategyTotals).map(([strategy, value]) => ({
		name: strategy,
		value,
		color: strategyColors[strategy] || '#6b7280'
	}))
} 