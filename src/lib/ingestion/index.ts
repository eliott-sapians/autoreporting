/**
 * Ingestion Module - Main Exports
 * Core functionality for Excel data ingestion with database operations
 */

export { ingestExcelFiles, ingestSingleFile } from '@/lib/ingestion/ingestion-service'
export { deletePortfolioData, insertPortfolioData, createOrUpdatePortfolio, createIngestionLog } from '@/lib/ingestion/database-operations'
export { moveProcessedFile } from '@/lib/ingestion/file-operations'

export type {
	IngestionOptions,
	IngestionResult,
	IngestionSummary,
	FileIngestionResult
} from '@/lib/ingestion/types' 