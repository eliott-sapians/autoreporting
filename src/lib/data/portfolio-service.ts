import { db } from '@/lib/db'
import { portfolio, portfolioData, type Portfolio, type PortfolioData } from '@/lib/db/schema'
import { eq, desc, max } from 'drizzle-orm'

/**
 * Simplified portfolio data service for raw data retrieval
 * Core database operations for the new Single Raw-Data API architecture
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
	 * Get portfolio metadata by business portfolio ID
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
	 * Get all fund data for a portfolio
	 */
	async getPortfolioFunds(portfolioId: string): Promise<PortfolioData[]> {
		const result = await db
			.select()
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))
			.orderBy(desc(portfolioData.extract_date))

		return result
	}

	/**
	 * Get latest extraction date for a portfolio
	 */
	async getLatestExtractionDate(portfolioId: string): Promise<string | null> {
		const result = await db
			.select({ 
				latestDate: max(portfolioData.extract_date) 
			})
			.from(portfolioData)
			.where(eq(portfolioData.portfolio_id, portfolioId))

		return result[0]?.latestDate || null
	}

	/**
	 * Get complete raw portfolio data (portfolio + funds)
	 * This is the main function for the new API endpoint
	 */
	async getRawPortfolioData(portfolioId: string) {
		const [portfolioMeta, funds, latestDate] = await Promise.all([
			this.getPortfolioMetadata(portfolioId),
			this.getPortfolioFunds(portfolioId),
			this.getLatestExtractionDate(portfolioId)
		])

		if (!portfolioMeta) {
			return null
		}

		// Helper function to convert string numbers to actual numbers
		const parseDecimal = (value: string | null): number | null => {
			if (value === null) return null
			const parsed = parseFloat(value)
			return isNaN(parsed) ? null : parsed
		}

		return {
			portfolio: {
				id: portfolioMeta.id,
				business_portfolio_id: portfolioMeta.business_portfolio_id,
				name: portfolioMeta.name || '',
				client_email: portfolioMeta.client_email,
				extractDate: latestDate || ''
			},
			funds: funds.map(fund => ({
				id: fund.id,
				balance: parseDecimal(fund.balance),
				label: fund.label,
				currency: fund.currency,
				valuation_eur: parseDecimal(fund.valuation_eur),
				weight_pct: parseDecimal(fund.weight_pct),
				isin: fund.isin,
				book_price_eur: parseDecimal(fund.book_price_eur),
				fees_eur: parseDecimal(fund.fees_eur),
				asset_name: fund.asset_name,
				strategy: fund.strategy,
				bucket: fund.bucket
			}))
		}
	}
}

// Export singleton instance
export const portfolioService = new PortfolioDataService() 