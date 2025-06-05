/**
 * Base interface for all slide data structures
 * Provides common properties and loading/error states
 */
export interface SlideData {
	portfolioId: string
	extractDate: string
	isLoading: boolean
	error: string | null
	lastUpdated: Date
}

/**
 * Slide 1 (Garde/Cover) data structure
 */
export interface GardeData extends SlideData {
	clientName: string
	businessPortfolioId: string
	extractDateFormatted: string // e.g., "Février 2025"
	advisorInfo: {
		name: string
		email: string
		phone?: string
	}
	accountDetails: {
		holder: 'Quintet' | 'Wealins'
		accountNumber?: string
	}
	companyBranding: {
		logoUrl?: string
		companyName: string
	}
}

/**
 * Slide 2 (Synthèse/Summary) data structure
 */
export interface SyntheseData extends SlideData {
	totalValuation: {
		amount: number
		formatted: string // e.g., "1 234 567 €"
		currency: string
	}
	bucketBreakdown: BucketAllocation[]
	strategyAllocation: StrategyAllocation[]
	chartData: {
		bucketChart: ChartDataPoint[]
		strategyChart: ChartDataPoint[]
	}
	performance: {
		total_performance_eur: number
		total_initial_investment: number
		performance_percentage: number
		formatted: string
		formatted_percentage: string
	}
}

/**
 * Slide 3 (Zoom) data structure for detailed analysis
 */
export interface ZoomData extends SlideData {
	strategies: StrategyDetail[]
	filters: FilterOptions
	analytics: {
		totalFunds: number
		totalValuation: number
		averageWeight: number
		concentrationRisk: number
	}
	chartData: {
		strategyComparison: ChartDataPoint[]
		performanceChart?: ChartDataPoint[]
		treemapData?: TreemapDataPoint[]
	}
}

/**
 * Slide 4 (Detail Provision) data structure
 */
export interface DetailProvisionData extends SlideData {
	funds: FundDetail[]
	provisionMetrics: {
		totalProvision: number
		provisionPercentage: number
		fundCount: number
	}
	tableData: TableRow[]
	chartData: {
		allocationChart: ChartDataPoint[]
	}
	pagination: {
		currentPage: number
		totalPages: number
		itemsPerPage: number
		totalItems: number
	}
}

/**
 * Bucket allocation data
 */
export interface BucketAllocation {
	bucket: string
	bucketDisplayName: string // French display name
	totalValuation: number
	fundCount: number
	weightPercentage: number
	color: string
}

/**
 * Strategy allocation data
 */
export interface StrategyAllocation {
	strategy: string
	strategyDisplayName: string // French display name
	totalValuation: number
	fundCount: number
	weightPercentage: number
	color: string
}

/**
 * Detailed strategy information
 */
export interface StrategyDetail extends StrategyAllocation {
	funds: FundDetail[]
	metrics: {
		averageWeight: number
		concentrationRisk: number
		topHoldings: FundDetail[]
	}
	performance: {
		performance_eur: number
		initial_investment: number
		performance_percentage: number
		formatted: string
		formatted_percentage: string
	}
}

/**
 * Detailed fund information
 */
export interface FundDetail {
	id: string
	isin: string
	name: string
	assetName: string
	strategy: string
	bucket: string
	valuation: number
	valuationFormatted: string
	weight: number
	weightFormatted: string
	currency: string
	bookPrice?: number
	fees?: number
	balance?: number
	label?: string
	metadata?: {
		assetClass?: string
		country?: string
		sector?: string
		riskRating?: string
	}
}

/**
 * Chart data point for Recharts compatibility
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
 * Treemap data point for hierarchical visualization
 */
export interface TreemapDataPoint {
	name: string
	value: number
	children?: TreemapDataPoint[]
	color: string
	metadata?: Record<string, any>
}

/**
 * Table row data for tabular displays
 */
export interface TableRow {
	id: string
	[key: string]: any // Flexible structure for different table types
}

/**
 * Filter options for data views
 */
export interface FilterOptions {
	strategy?: string[]
	bucket?: string[]
	dateRange?: {
		from: string
		to: string
	}
	valuationRange?: {
		min: number
		max: number
	}
	sortBy: SortOption
	searchQuery?: string
}

/**
 * Sort options
 */
export interface SortOption {
	field: string
	direction: 'asc' | 'desc'
}

/**
 * Calculation result types
 */
export interface AggregationResult {
	total: number
	average: number
	count: number
	percentage: number
	formatted: string
}

/**
 * Error and loading state interfaces
 */
export interface LoadingState {
	isLoading: boolean
	loadingMessage?: string
	progress?: number
}

export interface ErrorState {
	hasError: boolean
	errorMessage: string
	errorCode?: string
	timestamp: Date
	retryable: boolean
}

/**
 * Configuration interfaces for dynamic behavior
 */
export interface SlideConfiguration {
	portfolioId: string
	slideType: 'garde' | 'synthese' | 'zoom' | 'detail-provision' | 'detail-liquid' | 'detail-illiquid'
	cacheSettings: {
		enabled: boolean
		ttl: number // Time to live in milliseconds
	}
	formatting: FormattingOptions
	filters?: FilterOptions
}

export interface FormattingOptions {
	locale: string
	currency: string
	dateFormat: string
	numberFormat: {
		decimals: number
		thousandsSeparator: string
		decimalSeparator: string
	}
	percentageFormat: {
		decimals: number
		showSymbol: boolean
	}
}

/**
 * Data transformation result
 */
export interface TransformationResult<T extends SlideData> {
	success: boolean
	data: T | null
	error: ErrorState | null
	metadata: {
		transformationTime: number
		cacheHit: boolean
		dataSource: string
		recordCount: number
	}
}

/**
 * Data refresh options
 */
export interface RefreshOptions {
	forceRefresh: boolean
	invalidateCache: boolean
	backgroundRefresh: boolean
	onProgress?: (progress: number) => void
	onComplete?: () => void
	onError?: (error: ErrorState) => void
} 