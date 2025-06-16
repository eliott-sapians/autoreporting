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
		pnl_eur: number | null
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
 * Slide 1: Garde/Cover Page Data
 * Fixed values and portfolio metadata
 */
export interface GardeData {
	conseiller: string // Leave blank for now
	teneurDeCompte: string // Fixed to "Quintet"
	assureur: string // Fixed to "Wealins"
	numeroDeCompte: string // portfolio_id 
	dateExtraction: string // French month + year (e.g., "Janvier 2025")
}

/**
 * Slide 2: Synthesis/Overview Data
 * Portfolio estimation and allocation charts
 */
export interface SyntheseData {
	estimationPortefeuille: number // Sum of all valuations
	estimationFormatted: string // Formatted currency
	repartitionParPoche: ChartDataPoint[] // Bucket allocation chart
	allocationStrategique: ChartDataPoint[] // Strategy allocation chart
}

/**
 * Slide 3: Zoom/Bucket Comparison Data
 * 3-column bucket analysis
 */
export interface ZoomData {
	buckets: Array<{
		bucketCode: string // CT, LTL, LTI
		bucketName: string // Display name
		totalValuation: number
		totalFormatted: string
		percentageOfPortfolio: number
		performancePercentage: number
		funds: Array<{
			name: string
			valuation: number
			percentage: number // percentage within this bucket
		}>
	}>
}

/**
 * Bucket Detail Data (used for slides 4, 5, 6)
 * Common structure for all bucket detail pages
 */
export interface BucketDetailData {
	bucketInfo: {
		code: string // CT, LTL, LTI
		name: string // Display name
		totalValuation: number
		totalFormatted: string
	}
	fundsTable: Array<{
		libelle: string // Fund name
		strategie: string // Strategy
		valorisation: string | number // Valuation (formatted or number)
		performancePercent?: string // Performance %
		performanceEur?: string // Performance EUR
		engagement?: number // For LTI: balance
		appele?: number // For LTI: (valuation-performance)/engagement %
		tvpi?: number // For LTI: TVPI
	}>
	fundsChart: ChartDataPoint[] // % of each fund within bucket
	restantADeployer?: number // For LTI only: engagement - appelé
	extractDate: string
}

// Type aliases for specific slides
export type Slide4Data = BucketDetailData // CT bucket detail
export type Slide5Data = BucketDetailData // LTL bucket detail  
export type Slide6Data = BucketDetailData // LTI bucket detail

/**
 * Legacy interfaces (keeping for backward compatibility)
 */
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