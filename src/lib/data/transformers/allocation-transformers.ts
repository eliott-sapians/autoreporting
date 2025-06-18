import type { PortfolioDataApiResponse, FundData } from '@/lib/types'
import { COLOR_SCHEMES, getStrategyColor } from './constants'
import { formatCurrency, calculateFundPerformance } from './utils'

/**
 * Allocation and filtering transformers
 */

/**
 * Filter funds by strategy for allocation charts
 */
export function getFundsByStrategy(apiResponse: PortfolioDataApiResponse, strategy?: string): FundData[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	const funds = apiResponse.data.funds

	const allFunds = funds.map(fund => {
		const { performance, performanceEur } = calculateFundPerformance(fund)
		
		return {
			name: fund.asset_name || fund.label || 'Unknown Fund',
			strategy: fund.strategy || 'Unknown',
			valuation: formatCurrency(fund.valuation_eur),
			performance,
			performanceEur
		}
	})
	
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

	return Object.entries(strategyTotals).map(([strategy, value]) => ({
		name: strategy,
		value,
		color: getStrategyColor(strategy)
	}))
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

	return Object.entries(bucketTotals).map(([bucket, value]) => ({
		name: bucket,
		value,
		color: COLOR_SCHEMES.buckets[bucket as keyof typeof COLOR_SCHEMES.buckets] || '#6b7280'
	}))
}

/**
 * Filter funds by bucket for specific analysis
 */
export function getFundsByBucket(apiResponse: PortfolioDataApiResponse, bucket?: string): FundData[] {
	if (!apiResponse.success || !apiResponse.data) {
		return []
	}

	if (!bucket) {
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

	// Filter based on the raw fund data and then transform
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