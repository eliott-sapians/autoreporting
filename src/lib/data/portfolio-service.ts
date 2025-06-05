import { db } from '@/lib/db'
import { portfolio, portfolioData, type Portfolio, type PortfolioData } from '@/lib/db/schema'
import { eq, sql, desc, and } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Core portfolio data service for database operations and data transformations
 * Provides the foundational architecture for all slide data transformations
 */
export class PortfolioDataService {
	
	/**
	 * Get portfolio metadata by ID
	 */
	async getPortfolioMetadata(portfolioId: string): Promise<Portfolio | null> {
		const result = await db
			.select()
			.from(portfolio)
			.where(eq(portfolio.id, portfolioId))
			.limit(1)

		return result[0] || null
	}

	/**
	 * Get portfolio metadata by business ID
	 */
	async getPortfolioByBusinessId(businessPortfolioId: string): Promise<Portfolio | null> {
		const result = await db
			.select()
			.from(portfolio)
			.where(eq(portfolio.business_portfolio_id, businessPortfolioId))
			.limit(1)

		return result[0] || null
	}

	/**
	 * Get all portfolio data for a specific portfolio
	 */
	async getPortfolioData(portfolioId: string): Promise<PortfolioData[]> {
		return await db
			.select()
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.orderBy(desc(portfolioData.extract_date))
	}

	/**
	 * Get latest portfolio data for a specific portfolio
	 */
	async getLatestPortfolioData(portfolioId: string): Promise<PortfolioData[]> {
		// Get the latest extract date first
		const latestDateResult = await db
			.select({ extract_date: portfolioData.extract_date })
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.orderBy(desc(portfolioData.extract_date))
			.limit(1)

		if (!latestDateResult[0]) {
			return []
		}

		const latestDate = latestDateResult[0].extract_date

		// Get all data for the latest date
		return await db
			.select()
			.from(portfolioData)
			.where(
				and(
					eq(portfolioData.portfolio_id, portfolioId),
					eq(portfolioData.extract_date, latestDate)
				)
			)
	}

	/**
	 * Get total portfolio valuation for a specific portfolio
	 */
	async getTotalValuation(portfolioId: string): Promise<number> {
		const result = await db
			.select({
				total: sql<number>`sum(${portfolioData.valuation_eur})`
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))

		return result[0]?.total || 0
	}

	/**
	 * Get portfolio data aggregated by strategy
	 */
	async getPortfolioByStrategy(portfolioId: string): Promise<Array<{
		strategy: string
		total_valuation: number
		total_initial_investment: number
		total_performance_eur: number
		performance_percentage: number
		fund_count: number
		weight_percentage: number
	}>> {
		const result = await db
			.select({
				strategy: portfolioData.strategy,
				total_valuation: sql<number>`sum(${portfolioData.valuation_eur})`,
				total_initial_investment: sql<number>`sum(${portfolioData.book_price_eur})`,
				total_performance_eur: sql<number>`sum(${portfolioData.valuation_eur} - ${portfolioData.book_price_eur})`,
				fund_count: sql<number>`count(*)`,
				weight_percentage: sql<number>`sum(${portfolioData.weight_pct})`
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.groupBy(portfolioData.strategy)
			.orderBy(sql`sum(${portfolioData.valuation_eur}) desc`)

		// Filter out null strategies and ensure type safety
		return result.filter(item => item.strategy !== null).map(item => {
			const totalInitialInvestment = item.total_initial_investment || 0
			const totalPerformanceEur = item.total_performance_eur || 0
			const performancePercentage = totalInitialInvestment > 0 
				? (totalPerformanceEur / totalInitialInvestment) * 100 
				: 0

			return {
				...item,
				strategy: item.strategy!,
				total_initial_investment: totalInitialInvestment,
				total_performance_eur: totalPerformanceEur,
				performance_percentage: performancePercentage
			}
		})
	}

	/**
	 * Get portfolio data aggregated by bucket
	 */
	async getPortfolioByBucket(portfolioId: string): Promise<Array<{
		bucket: string
		total_valuation: number
		total_initial_investment: number
		total_performance_eur: number
		performance_percentage: number
		fund_count: number
		weight_percentage: number
	}>> {
		const result = await db
			.select({
				bucket: portfolioData.bucket,
				total_valuation: sql<number>`sum(${portfolioData.valuation_eur})`,
				total_initial_investment: sql<number>`sum(${portfolioData.book_price_eur})`,
				total_performance_eur: sql<number>`sum(${portfolioData.valuation_eur} - ${portfolioData.book_price_eur})`,
				fund_count: sql<number>`count(*)`,
				weight_percentage: sql<number>`sum(${portfolioData.weight_pct})`
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.groupBy(portfolioData.bucket)
			.orderBy(sql`sum(${portfolioData.valuation_eur}) desc`)

		// Filter out null buckets and ensure type safety
		return result.filter(item => item.bucket !== null).map(item => {
			const totalInitialInvestment = item.total_initial_investment || 0
			const totalPerformanceEur = item.total_performance_eur || 0
			const performancePercentage = totalInitialInvestment > 0 
				? (totalPerformanceEur / totalInitialInvestment) * 100 
				: 0

			return {
				...item,
				bucket: item.bucket!,
				total_initial_investment: totalInitialInvestment,
				total_performance_eur: totalPerformanceEur,
				performance_percentage: performancePercentage
			}
		})
	}

	/**
	 * Get latest extract date for a portfolio
	 */
	async getLatestExtractDate(portfolioId: string): Promise<string | null> {
		const result = await db
			.select({ extract_date: portfolioData.extract_date })
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.orderBy(desc(portfolioData.extract_date))
			.limit(1)

		return result[0]?.extract_date || null
	}

	/**
	 * Get detailed fund data with performance calculations
	 */
	async getFundsWithPerformance(portfolioId: string): Promise<Array<{
		id: string
		isin: string | null
		asset_name: string | null
		strategy: string | null
		bucket: string | null
		valuation_eur: number
		book_price_eur: number
		performance_eur: number
		performance_percentage: number
		weight_pct: number
		currency: string | null
		fees_eur: number | null
		balance: number | null
		label: string | null
	}>> {
		const result = await db
			.select({
				id: portfolioData.id,
				isin: portfolioData.isin,
				asset_name: portfolioData.asset_name,
				strategy: portfolioData.strategy,
				bucket: portfolioData.bucket,
				valuation_eur: portfolioData.valuation_eur,
				book_price_eur: portfolioData.book_price_eur,
				weight_pct: portfolioData.weight_pct,
				currency: portfolioData.currency,
				fees_eur: portfolioData.fees_eur,
				balance: portfolioData.balance,
				label: portfolioData.label
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.orderBy(desc(portfolioData.valuation_eur))

		return result.map(fund => {
			const valuationEur = Number(fund.valuation_eur) || 0
			const bookPriceEur = Number(fund.book_price_eur) || 0
			const performanceEur = valuationEur - bookPriceEur
			const performancePercentage = bookPriceEur > 0 
				? (performanceEur / bookPriceEur) * 100 
				: 0

			return {
				...fund,
				valuation_eur: valuationEur,
				book_price_eur: bookPriceEur,
				performance_eur: performanceEur,
				performance_percentage: performancePercentage,
				weight_pct: Number(fund.weight_pct) || 0,
				fees_eur: fund.fees_eur ? Number(fund.fees_eur) : null,
				balance: fund.balance ? Number(fund.balance) : null
			}
		})
	}

	/**
	 * Get portfolio performance data
	 * Performance = valuation_eur - book_price_eur
	 */
	async getPortfolioPerformance(portfolioId: string): Promise<{
		total_performance_eur: number
		total_initial_investment: number
		total_valuation: number
		performance_percentage: number
	}> {
		const result = await db
			.select({
				total_valuation: sql<number>`sum(${portfolioData.valuation_eur})`,
				total_initial_investment: sql<number>`sum(${portfolioData.book_price_eur})`,
				total_performance_eur: sql<number>`sum(${portfolioData.valuation_eur} - ${portfolioData.book_price_eur})`
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))

		const data = result[0]
		const totalValuation = data?.total_valuation || 0
		const totalInitialInvestment = data?.total_initial_investment || 0
		const totalPerformanceEur = data?.total_performance_eur || 0

		// Calculate performance percentage
		const performancePercentage = totalInitialInvestment > 0 
			? (totalPerformanceEur / totalInitialInvestment) * 100 
			: 0

		return {
			total_performance_eur: totalPerformanceEur,
			total_initial_investment: totalInitialInvestment,
			total_valuation: totalValuation,
			performance_percentage: performancePercentage
		}
	}
}

/**
 * Cached instance of PortfolioDataService for performance optimization
 */
export const portfolioService = new PortfolioDataService()

/**
 * Cached portfolio metadata retrieval
 */
export const getCachedPortfolioMetadata = cache(async (portfolioId: string) => {
	return await portfolioService.getPortfolioMetadata(portfolioId)
})

/**
 * Cached latest portfolio data retrieval
 */
export const getCachedLatestPortfolioData = cache(async (portfolioId: string) => {
	return await portfolioService.getLatestPortfolioData(portfolioId)
})

/**
 * Cached total valuation retrieval
 */
export const getCachedTotalValuation = cache(async (portfolioId: string) => {
	return await portfolioService.getTotalValuation(portfolioId)
}) 