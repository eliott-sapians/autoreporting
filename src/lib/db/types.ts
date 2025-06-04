// Re-export types from schema for easy importing
export type {
	Portfolio,
	NewPortfolio,
	PortfolioData,
	NewPortfolioData,
	IngestionLog,
	NewIngestionLog
} from './schema'

// Excel parsing types
export interface ExcelPortfolioData {
	portfolioId: string      // From cell B1
	extractDate: string      // From cell B5
	rows: ExcelRowData[]
}

export interface ExcelRowData {
	balance: string
	label: string
	currency: string
	valuationEur: string
	weightPct: string
	isin: string
	bookPriceEur: string
	feesEur: string
	assetName: string
	strategy: string
	bucket: string
}

// API response types
export interface IngestionResult {
	success: boolean
	portfolioId: string
	rowsProcessed: number
	errors?: string[]
} 