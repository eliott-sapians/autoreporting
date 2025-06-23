import type { PortfolioDataApiResponse } from '@/lib/types'
import type { 
	GardeData, 
	SyntheseData, 
	ZoomData, 
	ChartDataPoint
} from '../slide-interfaces'
import { BUCKET_MAPPING, mapToBucketCode, COLOR_SCHEMES } from './constants'
import { formatCurrency } from './utils'
import { getStrategyAllocation } from './allocation-transformers'
import { formatFrenchMonthYear, formatDDMMYYYY } from '../french-localization'

/**
 * Main slide transformers for the 6 presentation slides
 */

/**
 * Transform raw portfolio data into GardeData format for the cover slide
 */
export function transformToGardeData(apiResponse: PortfolioDataApiResponse): GardeData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const portfolio = apiResponse.data.portfolio

	return {
		portfolioName: portfolio.name,
		conseiller: '', // Leave blank for now
		teneurDeCompte: 'Quintet', // Fixed value
		assureur: 'Wealins', // Fixed value
		numeroDeCompte: portfolio.business_portfolio_id,
		dateExtraction: formatFrenchMonthYear(portfolio.extractDate)
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
	
	// Calculate total valuation and total PnL
	const totalValuation = funds.reduce((sum, fund) => {
		return sum + (fund.valuation_eur || 0)
	}, 0)

	const totalPnL = funds.reduce((sum, fund) => {
		return sum + (fund.pnl_eur || 0)
	}, 0)

	// Calculate portfolio performance percentage
	const costBasis = totalValuation - totalPnL
	const portfolioPerformancePercentage = costBasis > 0 ? ((totalValuation / costBasis) - 1) * 100 : 0
	
	// Format performance for display
	const performanceSign = portfolioPerformancePercentage >= 0 ? '+' : ''
	const portfolioPerformanceFormatted = `${performanceSign}${portfolioPerformancePercentage.toFixed(2)}%`

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

	const bucketChart: ChartDataPoint[] = Object.entries(bucketTotals)
		.filter(([_, value]) => value > 0) // Only include buckets with positive valuation
		.map(([bucket, value]) => {
			const percentage = totalValuation > 0 ? (value / totalValuation) * 100 : 0
			return {
				name: bucket,
				value,
				color: COLOR_SCHEMES.buckets[bucket as keyof typeof COLOR_SCHEMES.buckets] || '#6b7280',
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
		estimationPortefeuille: totalValuation,
		estimationFormatted: formatCurrency(totalValuation),
		portfolioPerformancePercentage,
		portfolioPerformanceFormatted,
		repartitionParPoche: bucketChart,
		allocationStrategique: strategyChart,
		extractDate: formatDDMMYYYY(apiResponse.data.portfolio.extractDate)
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
	
	// Group by bucket for the zoom view
	const portfolioTotal = funds.reduce((sum, fund) => sum + (fund.valuation_eur || 0), 0)
	
	const bucketData = funds.reduce((acc, fund) => {
		const bucketCode = mapToBucketCode(fund.bucket)
		if (!bucketCode) return acc
		
		const valuation = fund.valuation_eur || 0
		const pnl_eur = fund.pnl_eur || 0

		// Determine strategy name (fallback to "Unknown")
		const strategy = fund.strategy || 'Unknown'
		
		// Initialise bucket entry if it does not exist
		if (!acc[bucketCode]) {
			acc[bucketCode] = {
				totalValuation: 0,
				totalPnl: 0,
				// Track aggregated valuations per strategy
				strategies: {} as Record<string, number>
			}
		}
		
		// Update bucket-level totals
		acc[bucketCode].totalValuation += valuation
		acc[bucketCode].totalPnl += pnl_eur

		// Aggregate valuation by strategy within the bucket
		acc[bucketCode].strategies[strategy] =
			(acc[bucketCode].strategies[strategy] || 0) + valuation
		
		return acc
	}, {} as Record<string, { 
		totalValuation: number; 
		totalPnl: number; 
		strategies: Record<string, number>
	}>)

	const buckets = Object.entries(bucketData).map(([bucketCode, data]) => {
		const config = BUCKET_MAPPING[bucketCode as keyof typeof BUCKET_MAPPING]
		const percentageOfPortfolio = portfolioTotal > 0 ? (data.totalValuation / portfolioTotal) * 100 : 0
		
		// Calculate performance percentage using correct formula: (valuation / (valuation - pnl)) - 1
		const costBasis = data.totalValuation - data.totalPnl
		const performancePercentage = costBasis > 0 ? ((data.totalValuation / costBasis) - 1) * 100 : 0
		
		// Build array with strategy-level aggregation and percentage within bucket
		// Filter out strategies with zero valuation from charts
		const fundsWithPercentage = Object.entries(data.strategies)
			.filter(([_, strategyValuation]) => strategyValuation > 0) // Only include strategies with positive valuation
			.map(([strategyName, strategyValuation]) => ({
				name: strategyName,
				valuation: strategyValuation,
				percentage: data.totalValuation > 0 ? (strategyValuation / data.totalValuation) * 100 : 0
			}))
		
		return {
			bucketCode,
			bucketName: config.name,
			totalValuation: data.totalValuation,
			totalFormatted: formatCurrency(data.totalValuation),
			percentageOfPortfolio,
			performancePercentage,
			funds: fundsWithPercentage
		}
	})

	return {
		buckets,
		extractDate: formatDDMMYYYY(apiResponse.data.portfolio.extractDate)
	}
} 