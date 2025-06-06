/**
 * Raw portfolio data interface for Single Raw-Data API architecture
 */
export interface RawPortfolioData {
	portfolio: {
		id: string
		business_portfolio_id: string
		name: string
		client_email: string
		extractDate: string
	}
	funds: Array<{
		id: string
		balance: number | null
		label: string | null
		currency: string | null
		valuation_eur: number | null
		weight_pct: number | null
		isin: string | null
		book_price_eur: number | null
		fees_eur: number | null
		asset_name: string | null
		strategy: string | null
		bucket: string | null
	}>
}

/**
 * Basic chart data interface for Recharts compatibility
 * Used by all slides for chart rendering
 */
export interface ChartDataPoint {
	name: string
	value: number
	label?: string
	color: string
	percentage?: number
	formatted?: string
}

/**
 * Simple slide data interfaces (will be implemented by transformers)
 * These are placeholders for the new architecture
 */
export interface GardeData {
	clientName: string
	businessPortfolioId: string
	extractDateFormatted: string
}

export interface SyntheseData {
	totalValuation: number
	totalFormatted: string
	bucketChart: ChartDataPoint[]
	strategyChart: ChartDataPoint[]
}

export interface ZoomData {
	strategies: Array<{
		name: string
		value: number
		fundCount: number
	}>
}

export interface DetailData {
	funds: Array<{
		name: string
		strategy: string
		valuation: string
		performance: string
	}>
}

export interface PerformanceData {
	totalPerformance: number
	performancePercentage: number
}

export interface FundWithMetrics {
	name: string
	valuation: number
	engagement: number
	tvpi: number
} 