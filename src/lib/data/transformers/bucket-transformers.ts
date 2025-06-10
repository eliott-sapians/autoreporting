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
		const pnl_eur = fund.pnl_eur || 0
		const balance = fund.balance || 0
		const costBasis = valuation - pnl_eur
		const performancePercent = costBasis > 0 ? ((valuation / costBasis) - 1) * 100 : 0

		const baseFund = {
			libelle: fund.asset_name || fund.label || 'Unknown Fund',
			strategie: fund.strategy || 'Unknown',
			valorisation: formatCurrency(valuation)
		}

		// Different data for LTI bucket vs others
		if (targetBucketCode === 'LTI') {
			const appele = balance > 0 ? ((valuation - pnl_eur) / balance) * 100 : 0
			const tvpi = (valuation - pnl_eur) > 0 ? valuation / (valuation - pnl_eur) : 0
			
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
				performanceEur: formatCurrency(pnl_eur)
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
			const pnl_eur = fund.pnl_eur || 0
			return sum + (valuation - pnl_eur)
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
	
	// Calculate total valuation and PnL
	const totalValuation = funds.reduce((sum, fund) => sum + (fund.valuation_eur || 0), 0)
	const totalPnl = funds.reduce((sum, fund) => sum + (fund.pnl_eur || 0), 0)
	
	// Parse performance EUR value (remove € and format)
	const performanceAmount = parseFloat(performanceEur.replace(/[€\s,]/g, '').replace(',', '.')) || 0
	const costBasis = totalValuation - totalPnl
	const performancePercentage = costBasis > 0 ? ((totalValuation / costBasis) - 1) * 100 : 0

	return {
		totalPerformance: performanceAmount,
		performancePercentage
	}
}

/**
 * Compute engagement and TVPI metrics for Slide 6 analysis
 * 
 * Engagement = (valuation - pnl) / balance
 * TVPI = valuation / (valuation - pnl)
 */
export function computeEngagementTVPI(apiResponse: PortfolioDataApiResponse): FundWithMetrics[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds

	return funds.map(fund => {
		const valuation = fund.valuation_eur || 0
		const pnl_eur = fund.pnl_eur || 0
		const balance = fund.balance || 0
		
		// Calculate engagement: (valuation - pnl) / balance
		const engagement = balance > 0 ? (valuation - pnl_eur) / balance : 0
		
		// Calculate TVPI: valuation / (valuation - pnl)
		const tvpi = (valuation - pnl_eur) > 0 ? valuation / (valuation - pnl_eur) : 0

		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			valuation,
			engagement,
			tvpi
		}
	}).filter(fund => fund.valuation > 0) // Only include funds with positive valuation
} 