/**
 * Parser-specific TypeScript interfaces and types
 * Focused on Excel parsing output without database operations
 */

// Main parser result interface
export interface ParseResult {
	success: boolean
	portfolioId: string | null
	extractDate: Date | null
	records: ParsedRowData[]
	errors: ParseError[]
	stats: ParseStats
}

// Individual parsed row data matching database schema
export interface ParsedRowData {
	rowNumber: number
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
}

// Parser-specific error types
export interface ParseError {
	type: 'CELL_EXTRACTION' | 'DATA_TRANSFORMATION' | 'ROW_PROCESSING' | 'SPECIAL_CELLS'
	message: string
	rowNumber?: number
	columnLetter?: string
	cellAddress?: string
	originalValue?: any
	severity: 'ERROR' | 'WARNING'
}

// Parser statistics
export interface ParseStats {
	totalRows: number
	processedRows: number
	skippedRows: number
	errorRows: number
	emptyRows: number
	startTime: Date
	endTime: Date
	processingTimeMs: number
}

// Cell extraction result
export interface CellExtractionResult {
	value: any
	isFormula: boolean
	isEmpty: boolean
	error?: string
}

// Row processing result
export interface RowProcessingResult {
	success: boolean
	data: ParsedRowData | null
	errors: ParseError[]
	isEmpty: boolean
}

// Special cells extraction result (B1, B5)
export interface SpecialCellsResult {
	portfolioId: string | null
	extractDate: Date | null
	errors: ParseError[]
}

// Data transformation options
export interface TransformationOptions {
	trimStrings: boolean
	normalizeNumbers: boolean
	validateISIN: boolean
	validateCurrency: boolean
	strictDateParsing: boolean
}

// Default transformation options
export const DEFAULT_TRANSFORMATION_OPTIONS: TransformationOptions = {
	trimStrings: true,
	normalizeNumbers: true,
	validateISIN: true,
	validateCurrency: true,
	strictDateParsing: false
}

// Parser configuration
export interface ParserConfig {
	transformationOptions: TransformationOptions
	skipEmptyRows: boolean
	continueOnError: boolean
	maxErrorsPerRow: number
}

// Default parser configuration
export const DEFAULT_PARSER_CONFIG: ParserConfig = {
	transformationOptions: DEFAULT_TRANSFORMATION_OPTIONS,
	skipEmptyRows: true,
	continueOnError: true,
	maxErrorsPerRow: 5
} 