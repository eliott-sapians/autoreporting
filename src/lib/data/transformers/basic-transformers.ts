import type { PortfolioDataApiResponse, FundData, TotalData, ProvisionData, ExtendedFundData } from '@/lib/types'
import { formatCurrency, calculatePortfolioPerformance, calculateFundPerformance } from './utils'

/**
 * Basic data transformers
 * These provide backward compatibility and basic data structures
 */

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