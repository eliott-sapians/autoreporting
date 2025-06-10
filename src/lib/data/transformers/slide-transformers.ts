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
import { formatFrenchMonthYear } from '../french-localization'

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

	const bucketChart: ChartDataPoint[] = Object.entries(bucketTotals).map(([bucket, value]) => {
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
		repartitionParPoche: bucketChart,
		allocationStrategique: strategyChart
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
		const performance = (valuation/(valuation-pnl_eur)) -1
		
		if (!acc[bucketCode]) {
			acc[bucketCode] = {
				totalValuation: 0,
				totalPnl: 0,
				totalPerformance: 0,
				funds: []
			}
		}
		
		acc[bucketCode].totalValuation += valuation
		acc[bucketCode].totalPnl += pnl_eur
		acc[bucketCode].totalPerformance += performance
		acc[bucketCode].funds.push({
			name: fund.asset_name || fund.label || 'Unknown Fund',
			valuation,
			pnl_eur
		})
		
		return acc
	}, {} as Record<string, { 
		totalValuation: number; 
		totalPnl: number; 
		totalPerformance: number;
		funds: Array<{ name: string; valuation: number; pnl_eur: number }>
	}>)

	const buckets = Object.entries(bucketData).map(([bucketCode, data]) => {
		const config = BUCKET_MAPPING[bucketCode as keyof typeof BUCKET_MAPPING]
		const percentageOfPortfolio = portfolioTotal > 0 ? (data.totalValuation / portfolioTotal) * 100 : 0
		
		// Fix performance calculation: avoid division by very small numbers
		const performancePercentage = (data.totalValuation / (data.totalValuation - data.totalPnl)) - 1
		
		// Calculate individual fund percentages within bucket
		const fundsWithPercentage = data.funds.map(fund => ({
			name: fund.name,
			valuation: fund.valuation,
			percentage: data.totalValuation > 0 ? (fund.valuation / data.totalValuation) * 100 : 0
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
		buckets
	}
} 