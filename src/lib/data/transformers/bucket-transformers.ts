import type { PortfolioDataApiResponse } from '@/lib/types'
import type { 
	DetailData, 
	PerformanceData, 
	FundWithMetrics,
	BucketDetailData,
	ChartDataPoint
} from '../slide-interfaces'
import { BUCKET_MAPPING, mapToBucketCode } from './constants'
import { formatCurrency, formatPercentage, calculateFundPerformance, calculatePortfolioPerformance } from './utils'

/**
 * Bucket-specific transformers for detail slides and legacy support
 */

/**
 * Transform raw portfolio data into CT bucket detail (Slide 4)
 */
export function transformToCTBucketData(apiResponse: PortfolioDataApiResponse): BucketDetailData | null {
	return transformToBucketDetailData(apiResponse, 'CT')
}

/**
 * Transform raw portfolio data into LTL bucket detail (Slide 5)
 */
export function transformToLTLBucketData(apiResponse: PortfolioDataApiResponse): BucketDetailData | null {
	return transformToBucketDetailData(apiResponse, 'LTL')
}

/**
 * Transform raw portfolio data into LTI bucket detail (Slide 6)
 */
export function transformToLTIBucketData(apiResponse: PortfolioDataApiResponse): BucketDetailData | null {
	return transformToBucketDetailData(apiResponse, 'LTI')
}

/**
 * Generic bucket detail transformer
 */
function transformToBucketDetailData(
	apiResponse: PortfolioDataApiResponse, 
	targetBucketCode: keyof typeof BUCKET_MAPPING
): BucketDetailData | null {
	if (!apiResponse.success || !apiResponse.data) {
		return null
	}

	const bucketConfig = BUCKET_MAPPING[targetBucketCode]
	const funds = apiResponse.data.funds

	// Filter funds for this bucket
	const bucketFunds = funds.filter(fund => {
		const bucketCode = mapToBucketCode(fund.bucket)
		return bucketCode === targetBucketCode
	})

	if (bucketFunds.length === 0) {
		return {
			bucketInfo: {
				code: targetBucketCode,
				name: bucketConfig.name,
				totalValuation: 0,
				totalFormatted: formatCurrency(0)
			},
			fundsTable: [],
			fundsChart: []
		}
	}

	// Calculate bucket total
	const bucketTotalValuation = bucketFunds.reduce((sum, fund) => sum + (fund.valuation_eur || 0), 0)

	// Create funds table data
	const fundsTable = bucketFunds.map(fund => {
		const valuation = fund.valuation_eur || 0
		const bookPrice = fund.book_price_eur || 0
		const balance = fund.balance || 0
		const performance = valuation - bookPrice
		const performancePercent = bookPrice > 0 ? (performance / bookPrice) * 100 : 0

		const baseFund = {
			libelle: fund.asset_name || fund.label || 'Unknown Fund',
			strategie: fund.strategy || 'Unknown',
			valorisation: formatCurrency(valuation)
		}

		// Different data for LTI bucket vs others
		if (targetBucketCode === 'LTI') {
			const appele = balance > 0 ? ((valuation - performance) / balance) * 100 : 0
			const tvpi = bookPrice > 0 ? valuation / bookPrice : 0
			
			return {
				...baseFund,
				engagement: balance,
				appele,
				tvpi,
				valorisation: valuation // Keep as number for LTI
			}
		} else {
			return {
				...baseFund,
				performancePercent: formatPercentage(performancePercent),
				performanceEur: formatCurrency(performance)
			}
		}
	})

	// Create funds chart data (% of each fund within bucket)
	const fundsChart: ChartDataPoint[] = bucketFunds.map(fund => {
		const valuation = fund.valuation_eur || 0
		const percentage = bucketTotalValuation > 0 ? (valuation / bucketTotalValuation) * 100 : 0
		
		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			value: valuation,
			color: '#3b82f6', // Default color, can be customized
			percentage,
			formatted: formatCurrency(valuation)
		}
	})

	const result: BucketDetailData = {
		bucketInfo: {
			code: targetBucketCode,
			name: bucketConfig.name,
			totalValuation: bucketTotalValuation,
			totalFormatted: formatCurrency(bucketTotalValuation)
		},
		fundsTable,
		fundsChart
	}

	// Add restantADeployer for LTI bucket
	if (targetBucketCode === 'LTI') {
		const totalEngagement = bucketFunds.reduce((sum, fund) => sum + (fund.balance || 0), 0)
		const totalAppele = bucketFunds.reduce((sum, fund) => {
			const valuation = fund.valuation_eur || 0
			const performance = valuation - (fund.book_price_eur || 0)
			return sum + (valuation - performance)
		}, 0)
		result.restantADeployer = totalEngagement - totalAppele
	}

	return result
}

/**
 * LEGACY TRANSFORMERS - For backward compatibility
 */

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
 * Compute engagement and TVPI metrics for Slide 6 analysis
 * 
 * Engagement = (valuation - performance) / balance
 * TVPI = valuation / (valuation - performance)
 */
export function computeEngagementTVPI(apiResponse: PortfolioDataApiResponse): FundWithMetrics[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds

	return funds.map(fund => {
		const valuation = fund.valuation_eur || 0
		const bookPrice = fund.book_price_eur || 0
		const balance = fund.balance || 0
		
		// Calculate performance (valuation - book price)
		const performance = valuation - bookPrice
		
		// Calculate engagement: (valuation - performance) / balance
		// This simplifies to: bookPrice / balance
		const engagement = balance > 0 ? bookPrice / balance : 0
		
		// Calculate TVPI: valuation / (valuation - performance)
		// This simplifies to: valuation / bookPrice
		const tvpi = bookPrice > 0 ? valuation / bookPrice : 0

		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			valuation,
			engagement,
			tvpi
		}
	}).filter(fund => fund.valuation > 0) // Only include funds with positive valuation
} 