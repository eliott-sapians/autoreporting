/**
 * Excel Parser Module Exports
 * Main entry point for all Excel parsing functionality
 */

// Main parser functions
export { 
	parseExcelFile, 
	canParseExcelFile, 
	extractMetadata 
} from './excel-parser'

// Cell extraction utilities
export {
	extractCellValue,
	extractStringValue,
	extractNumericValue,
	extractDateValue,
	createCellExtractionError
} from './cell-extractor'

// Data transformation functions
export {
	transformBalance,
	transformLabel,
	transformCurrency,
	transformValuationEur,
	transformWeightPct,
	transformISIN,
	transformBookPriceEur,
	transformFeesEur,
	transformAssetName,
	transformStrategy,
	transformBucket,
	transformExtractionDate
} from './data-transformer'

// Row processing functions
export {
	processDataRow,
	processDataRows,
	validateProcessedRow
} from './row-processor'

// Types and configurations
export type {
	ParseResult,
	ParsedRowData,
	ParseError,
	ParseStats,
	CellExtractionResult,
	RowProcessingResult,
	SpecialCellsResult,
	TransformationOptions,
	ParserConfig
} from '@/lib/excel/types/parser'

export {
	DEFAULT_TRANSFORMATION_OPTIONS,
	DEFAULT_PARSER_CONFIG
} from '@/lib/excel/types/parser' 