/**
 * Ingestion System Type Definitions
 * Types for CLI, API, and core ingestion functionality
 */

import type { ParseResult, ParseError } from '@/lib/excel/types/parser'

// CLI and API options
export interface IngestionOptions {
	filePath?: string      // Specific file to process (optional)
	force?: boolean        // Skip confirmation prompts
	dryRun?: boolean       // Validate only, no database changes
	skipValidation?: boolean // Skip Excel validation (dangerous)
	continueOnError?: boolean // Continue processing other files if one fails
}

// Result for a single file ingestion
export interface FileIngestionResult {
	filePath: string
	fileName: string
	success: boolean
	portfolioId: string | null
	extractDate: Date | null
	rowsProcessed: number
	rowsSkipped: number
	rowsWithErrors: number
	processingTimeMs: number
	errors: string[]
	parseResult?: ParseResult
	movedTo?: string // Where the file was moved after processing
}

// Overall ingestion summary for multiple files
export interface IngestionSummary {
	totalFiles: number
	successfulFiles: number
	failedFiles: number
	totalRowsProcessed: number
	totalErrors: number
	totalProcessingTimeMs: number
	startTime: Date
	endTime: Date
}

// Main ingestion result
export interface IngestionResult {
	success: boolean
	summary: IngestionSummary
	fileResults: FileIngestionResult[]
	globalErrors: string[] // Errors not specific to a file
}

// Database operation results
export interface DatabaseOperationResult {
	success: boolean
	rowsAffected: number
	errors: string[]
}

// File operation results
export interface FileOperationResult {
	success: boolean
	originalPath: string
	newPath?: string
	error?: string
}

// Portfolio data for database insertion
export interface PortfolioDataInsert {
	portfolio_id: string
	extract_date: Date
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
} 