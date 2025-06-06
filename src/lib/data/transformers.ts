import type { PortfolioDataApiResponse, FundData, TotalData, ProvisionData, ExtendedFundData } from '@/lib/types'
import type { 
	GardeData, 
	SyntheseData, 
	ZoomData, 
	DetailData, 
	PerformanceData, 
	ChartDataPoint 
} from './slide-interfaces'

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

/**
 * Transform raw portfolio data into GardeData format for the cover slide
 */
export function transformToGardeData(apiResponse: PortfolioDataApiResponse): GardeData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const portfolio = apiResponse.data.portfolio
	
	// Format extract date to French format
	const extractDate = new Date(portfolio.extractDate)
	const extractDateFormatted = extractDate.toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: '2-digit', 
		year: 'numeric'
	})

	return {
		clientName: portfolio.name || 'Client',
		businessPortfolioId: portfolio.business_portfolio_id,
		extractDateFormatted
	}
}

/**
 * Transform raw portfolio data into SyntheseData format for the synthesis slide
 */
export function transformToSyntheseData(apiResponse: PortfolioDataApiResponse): SyntheseData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const funds = apiResponse.data.funds
	
	// Calculate total valuation
	const totalValuation = funds.reduce((sum, fund) => {
		return sum + (fund.valuation_eur || 0)
	}, 0)

	// Get bucket allocation data
	const bucketTotals = funds.reduce((acc, fund) => {
		const bucket = fund.bucket || 'Unknown'
		const valuation = fund.valuation_eur || 0
		
		if (!acc[bucket]) {
			acc[bucket] = 0
		}
		acc[bucket] += valuation
		
		return acc
	}, {} as Record<string, number>)

	// Bucket colors mapping
	const bucketColors: Record<string, string> = {
		'Core': '#F4F3EE',
		'Satellite': '#D8D8D8', 
		'Provision': '#A1DFF0',
		'Unknown': '#6b7280'
	}

	const bucketChart: ChartDataPoint[] = Object.entries(bucketTotals).map(([bucket, value]) => {
		const percentage = totalValuation > 0 ? (value / totalValuation) * 100 : 0
		return {
			name: bucket,
			value,
			color: bucketColors[bucket] || '#6b7280',
			percentage,
			formatted: formatCurrency(value)
		}
	})

	// Get strategy allocation data
	const strategyAllocation = getStrategyAllocation(apiResponse)
	const strategyChart: ChartDataPoint[] = strategyAllocation.map(item => {
		const percentage = totalValuation > 0 ? (item.value / totalValuation) * 100 : 0
		return {
			name: item.name,
			value: item.value,
			color: item.color,
			percentage,
			formatted: formatCurrency(item.value)
		}
	})

	return {
		totalValuation,
		totalFormatted: formatCurrency(totalValuation),
		bucketChart,
		strategyChart
	}
}

/**
 * Transform raw portfolio data into ZoomData format for the zoom slide  
 */
export function transformToZoomData(apiResponse: PortfolioDataApiResponse): ZoomData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const funds = apiResponse.data.funds
	
	// Group by strategy and calculate metrics
	const strategyData = funds.reduce((acc, fund) => {
		const strategy = fund.strategy || 'Unknown'
		const valuation = fund.valuation_eur || 0
		
		if (!acc[strategy]) {
			acc[strategy] = {
				value: 0,
				fundCount: 0
			}
		}
		
		acc[strategy].value += valuation
		acc[strategy].fundCount += 1
		
		return acc
	}, {} as Record<string, { value: number; fundCount: number }>)

	const strategies = Object.entries(strategyData).map(([name, data]) => ({
		name,
		value: data.value,
		fundCount: data.fundCount
	}))

	return {
		strategies
	}
}

/**
 * Transform raw portfolio data into DetailData format for detail slides
 */
export function transformToDetailData(apiResponse: PortfolioDataApiResponse, filterStrategy?: string): DetailData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	let funds = apiResponse.data.funds
	
	// Filter by strategy if provided
	if (filterStrategy) {
		funds = funds.filter(fund => fund.strategy === filterStrategy)
	}

	const detailFunds = funds.map(fund => {
		const { performance } = calculateFundPerformance(fund)
		
		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			strategy: fund.strategy || 'Unknown',
			valuation: formatCurrency(fund.valuation_eur),
			performance
		}
	})

	return {
		funds: detailFunds
	}
}

/**
 * Transform raw portfolio data into PerformanceData format
 */
export function transformToPerformanceData(apiResponse: PortfolioDataApiResponse): PerformanceData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const funds = apiResponse.data.funds
	const { performanceEur } = calculatePortfolioPerformance(funds)
	
	// Calculate total book price for percentage calculation
	const totalBookPrice = funds.reduce((sum, fund) => {
		return sum + (fund.book_price_eur || 0)
	}, 0)
	
	// Parse performance EUR value (remove € and format)
	const performanceAmount = parseFloat(performanceEur.replace(/[€\s,]/g, '').replace(',', '.')) || 0
	const performancePercentage = totalBookPrice > 0 ? (performanceAmount / totalBookPrice) * 100 : 0

	return {
		totalPerformance: performanceAmount,
		performancePercentage
	}
}

/**
 * Get bucket allocation data for charts
 */
export function getBucketAllocation(apiResponse: PortfolioDataApiResponse): Array<{
	name: string
	value: number
	color: string
}> {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds
	
	// Group by bucket
	const bucketTotals = funds.reduce((acc, fund) => {
		const bucket = fund.bucket || 'Unknown'
		const valuation = fund.valuation_eur || 0
		
		if (!acc[bucket]) {
			acc[bucket] = 0
		}
		acc[bucket] += valuation
		
		return acc
	}, {} as Record<string, number>)

	// Default bucket colors mapping (can be customized per slide)
	const bucketColors: Record<string, string> = {
		'Core': '#F4F3EE',
		'Satellite': '#D8D8D8',
		'Provision': '#A1DFF0',
		'Long-terme': '#3b82f6',
		'Court-terme': '#10b981', 
		'Unknown': '#6b7280'
	}

	return Object.entries(bucketTotals).map(([bucket, value]) => ({
		name: bucket,
		value,
		color: bucketColors[bucket] || '#6b7280'
	}))
}

/**
 * Filter funds by bucket for specific analysis
 */
export function getFundsByBucket(apiResponse: PortfolioDataApiResponse, bucket?: string): FundData[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const allFunds = transformToFundData(apiResponse)
	
	if (!bucket) {
		return allFunds
	}

	// This requires adding bucket info to FundData interface, or creating a new interface
	// For now, we'll filter based on the raw fund data and then transform
	const filteredRawFunds = apiResponse.data.funds.filter(fund => fund.bucket === bucket)
	
	return filteredRawFunds.map(fund => {
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
 * Transform raw portfolio data into ExtendedFundData array with all available information
 */
export function transformToExtendedFundData(apiResponse: PortfolioDataApiResponse): ExtendedFundData[] {
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
			performanceEur,
			bucket: fund.bucket || undefined,
			isin: fund.isin || undefined,
			currency: fund.currency || undefined,
			balance: formatCurrency(fund.balance),
			fees: formatCurrency(fund.fees_eur)
		}
	})
} 