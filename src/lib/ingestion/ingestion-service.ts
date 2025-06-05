/**
 * Core Ingestion Service
 * Orchestrates the complete ingestion process from Excel files to database
 */

import path from 'path'
import { parseExcelFile } from '@/lib/excel'
import { scanForExcelFiles } from '@/lib/excel/file-management/scanner'
import { replacePortfolioData, createIngestionLog } from './database-operations'
import { moveProcessedFile, fileExists, EXCEL_DIRECTORIES } from './file-operations'
import type { 
	IngestionOptions, 
	IngestionResult, 
	IngestionSummary, 
	FileIngestionResult,
	PortfolioDataInsert 
} from './types'
import type { ParsedRowData, ParseResult } from '@/lib/excel/types/parser'

/**
 * Main ingestion function - processes all files or a specific file
 */
export async function ingestExcelFiles(options: IngestionOptions = {}): Promise<IngestionResult> {
	const startTime = new Date()
	const globalErrors: string[] = []
	const fileResults: FileIngestionResult[] = []

	console.log(`[INGESTION] Starting ingestion process...`)
	console.log(`[INGESTION] Options:`, options)

	try {
		// Determine which files to process
		const filesToProcess = await determineFilesToProcess(options)
		
		if (filesToProcess.length === 0) {
			globalErrors.push('No Excel files found to process')
			return createFailureResult(startTime, globalErrors, fileResults)
		}

		console.log(`[INGESTION] Found ${filesToProcess.length} file(s) to process`)

		// Process each file
		for (const filePath of filesToProcess) {
			console.log(`\n[INGESTION] Processing file: ${filePath}`)
			
			try {
				const fileResult = await ingestSingleFile(filePath, options)
				fileResults.push(fileResult)
				
				if (!fileResult.success && !options.continueOnError) {
					console.log(`[INGESTION] Stopping on error as continueOnError is false`)
					break
				}
			} catch (error) {
				console.error(`[INGESTION] Unexpected error processing ${filePath}:`, error)
				
				const failedFileResult: FileIngestionResult = {
					filePath,
					fileName: path.basename(filePath),
					success: false,
					portfolioId: null,
					extractDate: null,
					rowsProcessed: 0,
					rowsSkipped: 0,
					rowsWithErrors: 0,
					processingTimeMs: 0,
					errors: [`Unexpected error: ${error}`]
				}
				
				fileResults.push(failedFileResult)
				
				if (!options.continueOnError) {
					break
				}
			}
		}

		// Build summary
		const endTime = new Date()
		const summary = buildIngestionSummary(startTime, endTime, fileResults)
		
		const overallSuccess = fileResults.length > 0 && fileResults.every(r => r.success)
		
		console.log(`\n[INGESTION] Ingestion completed`)
		console.log(`[INGESTION] Summary:`, summary)

		return {
			success: overallSuccess,
			summary,
			fileResults,
			globalErrors
		}

	} catch (error) {
		console.error(`[INGESTION] Fatal error during ingestion:`, error)
		globalErrors.push(`Fatal ingestion error: ${error}`)
		return createFailureResult(startTime, globalErrors, fileResults)
	}
}

/**
 * Process a single Excel file
 */
export async function ingestSingleFile(filePath: string, options: IngestionOptions = {}): Promise<FileIngestionResult> {
	const startTime = new Date()
	const fileName = path.basename(filePath)
	
	console.log(`[INGESTION] Processing single file: ${fileName}`)

	// Validate file exists
	if (!await fileExists(filePath)) {
		return createFailedFileResult(filePath, [`File not found: ${filePath}`], startTime)
	}

	try {
		// Step 1: Parse Excel file using Task 3 parser
		console.log(`[INGESTION] Parsing Excel file...`)
		const parseResult = await parseExcelFile(filePath)
		
		if (!parseResult.success) {
			const errors = parseResult.errors.map(e => e.message)
			console.log(`[INGESTION] Parsing failed with errors:`, errors)
			
			// Move file to error directory
			if (!options.dryRun) {
				await moveProcessedFile(filePath, false)
			}
			
			return createFailedFileResult(filePath, errors, startTime, parseResult)
		}

		const { portfolioId, extractDate, records } = parseResult
		
		if (!portfolioId || !extractDate) {
			const error = 'Missing required portfolio ID or extract date'
			console.log(`[INGESTION] ${error}`)
			
			if (!options.dryRun) {
				await moveProcessedFile(filePath, false)
			}
			
			return createFailedFileResult(filePath, [error], startTime, parseResult)
		}

		console.log(`[INGESTION] Successfully parsed: Portfolio ${portfolioId}, Date ${extractDate.toDateString()}, ${records.length} records`)

		// Step 2: Transform data for database insertion
		console.log(`[INGESTION] Transforming data for database insertion...`)
		const portfolioDataRows = transformParsedData(portfolioId, extractDate, records)

		// Step 3: Database operations (skip in dry-run mode)
		if (options.dryRun) {
			console.log(`[INGESTION] DRY RUN: Would insert ${portfolioDataRows.length} rows into database`)
			
			return {
				filePath,
				fileName,
				success: true,
				portfolioId,
				extractDate,
				rowsProcessed: records.length,
				rowsSkipped: parseResult.stats.skippedRows,
				rowsWithErrors: parseResult.errors.length,
				processingTimeMs: Date.now() - startTime.getTime(),
				errors: [],
				parseResult
			}
		}

		// Step 4: Execute database transaction
		console.log(`[INGESTION] Executing database transaction...`)
		const dbResult = await replacePortfolioData(portfolioId, extractDate, portfolioDataRows)
		
		if (!dbResult.success) {
			console.log(`[INGESTION] Database operation failed:`, dbResult.errors)
			
			await moveProcessedFile(filePath, false)
			
			return createFailedFileResult(filePath, dbResult.errors, startTime, parseResult)
		}

		// Step 5: Create audit log
		console.log(`[INGESTION] Creating audit log...`)
		await createIngestionLog(
			portfolioId,
			fileName,
			extractDate,
			records.length,
			'success'
		)

		// Step 6: Move file to processed directory
		console.log(`[INGESTION] Moving file to processed directory...`)
		const moveResult = await moveProcessedFile(filePath, true, portfolioId, extractDate)
		
		const endTime = new Date()
		
		console.log(`[INGESTION] Successfully processed ${fileName}`)

		return {
			filePath,
			fileName,
			success: true,
			portfolioId,
			extractDate,
			rowsProcessed: records.length,
			rowsSkipped: parseResult.stats.skippedRows,
			rowsWithErrors: parseResult.errors.filter(e => e.severity === 'ERROR').length,
			processingTimeMs: endTime.getTime() - startTime.getTime(),
			errors: [],
			parseResult,
			movedTo: moveResult.newPath
		}

	} catch (error) {
		console.error(`[INGESTION] Unexpected error processing ${fileName}:`, error)
		
		// Move file to error directory
		if (!options.dryRun) {
			await moveProcessedFile(filePath, false)
		}
		
		return createFailedFileResult(filePath, [`Unexpected error: ${error}`], startTime)
	}
}

/**
 * Determine which files to process based on options
 */
async function determineFilesToProcess(options: IngestionOptions): Promise<string[]> {
	if (options.filePath) {
		// Process specific file
		const absolutePath = path.isAbsolute(options.filePath) 
			? options.filePath 
			: path.resolve(options.filePath)
			
		if (await fileExists(absolutePath)) {
			return [absolutePath]
		} else {
			// Try relative to data/excel/incoming directory
			const relativePath = path.join(EXCEL_DIRECTORIES.INCOMING, options.filePath)
			if (await fileExists(relativePath)) {
				return [relativePath]
			}
		}
		
		throw new Error(`Specified file not found: ${options.filePath}`)
	}

	// Process all files in data/excel/incoming directory
	console.log(`[INGESTION] Scanning for Excel files in ${EXCEL_DIRECTORIES.INCOMING}`)
	const scanResult = await scanForExcelFiles(EXCEL_DIRECTORIES.INCOMING)
	
	if (scanResult.errors.length > 0) {
		console.warn(`[INGESTION] File scanning warnings:`, scanResult.errors)
	}

	return scanResult.files.map(f => f.filePath || f.filename).filter(Boolean) as string[]
}

/**
 * Transform parsed Excel data to database insertion format
 * Note: portfolio_id will be replaced with UUID in replacePortfolioData
 */
function transformParsedData(
	businessPortfolioId: string,
	extractDate: Date,
	records: ParsedRowData[]
): PortfolioDataInsert[] {
	return records.map(record => ({
		portfolio_id: businessPortfolioId, // This will be replaced with UUID in replacePortfolioData
		extract_date: extractDate,
		balance: record.balance,
		label: record.label,
		currency: record.currency,
		valuation_eur: record.valuation_eur,
		weight_pct: record.weight_pct,
		isin: record.isin,
		book_price_eur: record.book_price_eur,
		fees_eur: record.fees_eur,
		asset_name: record.asset_name,
		strategy: record.strategy,
		bucket: record.bucket
	}))
}

/**
 * Build ingestion summary from file results
 */
function buildIngestionSummary(
	startTime: Date,
	endTime: Date,
	fileResults: FileIngestionResult[]
): IngestionSummary {
	const successfulFiles = fileResults.filter(r => r.success).length
	const totalRowsProcessed = fileResults.reduce((sum, r) => sum + r.rowsProcessed, 0)
	const totalErrors = fileResults.reduce((sum, r) => sum + r.errors.length, 0)
	const totalProcessingTimeMs = fileResults.reduce((sum, r) => sum + r.processingTimeMs, 0)

	return {
		totalFiles: fileResults.length,
		successfulFiles,
		failedFiles: fileResults.length - successfulFiles,
		totalRowsProcessed,
		totalErrors,
		totalProcessingTimeMs,
		startTime,
		endTime
	}
}

/**
 * Create failed file result
 */
function createFailedFileResult(
	filePath: string,
	errors: string[],
	startTime: Date,
	parseResult?: ParseResult
): FileIngestionResult {
	return {
		filePath,
		fileName: path.basename(filePath),
		success: false,
		portfolioId: parseResult?.portfolioId || null,
		extractDate: parseResult?.extractDate || null,
		rowsProcessed: 0,
		rowsSkipped: parseResult?.stats?.skippedRows || 0,
		rowsWithErrors: errors.length,
		processingTimeMs: Date.now() - startTime.getTime(),
		errors,
		parseResult
	}
}

/**
 * Create failure result for the entire ingestion
 */
function createFailureResult(
	startTime: Date,
	globalErrors: string[],
	fileResults: FileIngestionResult[]
): IngestionResult {
	const endTime = new Date()
	
	return {
		success: false,
		summary: buildIngestionSummary(startTime, endTime, fileResults),
		fileResults,
		globalErrors
	}
} 