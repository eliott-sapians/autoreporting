/**
 * Main Excel Parser Implementation
 * Orchestrates the complete Excel parsing process using exceljs
 */

import ExcelJS from 'exceljs'
import { validateExcelStructure } from '@/lib/excel/validation/excel-format'
import { SPECIAL_CELLS } from '@/lib/excel/constants/columns'
import { extractStringValue, extractDateValue, createCellExtractionError } from './cell-extractor'
import { transformExtractionDate } from './data-transformer'
import { processDataRows } from './row-processor'
import type { 
	ParseResult, 
	ParseError, 
	SpecialCellsResult, 
	ParserConfig,
	ParseStats
} from '@/lib/excel/types/parser'
import { DEFAULT_PARSER_CONFIG } from '@/lib/excel/types/parser'

/**
 * Main function to parse an Excel file
 */
export async function parseExcelFile(
	filePath: string,
	config: ParserConfig = DEFAULT_PARSER_CONFIG
): Promise<ParseResult> {
	const startTime = new Date()
	const errors: ParseError[] = []
	let portfolioId: string | null = null
	let extractDate: Date | null = null

	try {
		// Step 1: Validate Excel structure using existing validation
		console.log(`[Parser] Starting validation of ${filePath}`)
		const structureValidation = await validateExcelStructure(filePath)
		
		if (!structureValidation.isValid) {
			// Convert validation errors to parser errors
			const validationErrors: ParseError[] = structureValidation.errors.map(error => ({
				type: 'SPECIAL_CELLS', // Most validation errors are structural
				message: error.message,
				rowNumber: error.rowNumber,
				severity: error.severity === 'ERROR' ? 'ERROR' : 'WARNING'
			}))

			return createFailedResult(validationErrors, startTime)
		}

		console.log(`[Parser] Validation passed, proceeding with parsing`)

		// Step 2: Open Excel workbook
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(filePath)
		
		const worksheet = workbook.getWorksheet(1)
		if (!worksheet) {
			errors.push({
				type: 'SPECIAL_CELLS',
				message: 'No worksheet found in Excel file',
				severity: 'ERROR'
			})
			return createFailedResult(errors, startTime)
		}

		// Step 3: Extract special cells (B1, B5)
		console.log(`[Parser] Extracting special cells (Portfolio ID and Extract Date)`)
		const specialCellsResult = extractSpecialCells(worksheet)
		errors.push(...specialCellsResult.errors)
		
		portfolioId = specialCellsResult.portfolioId
		extractDate = specialCellsResult.extractDate

		// Check if special cells extraction failed
		if (!portfolioId || !extractDate) {
			const missingCells = []
			if (!portfolioId) missingCells.push('Portfolio ID (B1)')
			if (!extractDate) missingCells.push('Extract Date (B5)')
			
			errors.push({
				type: 'SPECIAL_CELLS',
				message: `Failed to extract required special cells: ${missingCells.join(', ')}`,
				severity: 'ERROR'
			})
			return createFailedResult(errors, startTime)
		}

		console.log(`[Parser] Extracted Portfolio ID: ${portfolioId}`)
		console.log(`[Parser] Extracted Extract Date: ${extractDate.toISOString()}`)

		// Step 4: Process data rows
		console.log(`[Parser] Processing data rows starting from row ${SPECIAL_CELLS.DATA_START_ROW}`)
		const dataEndRow = worksheet.rowCount || SPECIAL_CELLS.DATA_START_ROW
		
		const rowProcessingResult = processDataRows(
			worksheet,
			SPECIAL_CELLS.DATA_START_ROW,
			dataEndRow,
			config.transformationOptions,
			config.skipEmptyRows
		)

		// Add row processing errors
		errors.push(...rowProcessingResult.allErrors)

		console.log(`[Parser] Processed ${rowProcessingResult.stats.processedRows} rows with ${rowProcessingResult.allErrors.length} errors`)

		// Step 5: Build final statistics
		const endTime = new Date()
		const stats: ParseStats = {
			...rowProcessingResult.stats,
			startTime,
			endTime,
			processingTimeMs: endTime.getTime() - startTime.getTime()
		}

		// Step 6: Determine overall success
		const hasErrors = errors.some(error => error.severity === 'ERROR')
		const success = !hasErrors && rowProcessingResult.processedRows.length > 0

		console.log(`[Parser] Parsing ${success ? 'completed successfully' : 'completed with errors'}`)
		console.log(`[Parser] Final stats:`, stats)

		return {
			success,
			portfolioId,
			extractDate,
			records: rowProcessingResult.processedRows,
			errors,
			stats
		}

	} catch (error) {
		console.error(`[Parser] Unexpected error during parsing:`, error)
		
		errors.push({
			type: 'SPECIAL_CELLS',
			message: `Unexpected error during Excel parsing: ${error}`,
			severity: 'ERROR'
		})

		return createFailedResult(errors, startTime)
	}
}

/**
 * Extract Portfolio ID (B1) and Extract Date (B5) from worksheet
 */
function extractSpecialCells(worksheet: ExcelJS.Worksheet): SpecialCellsResult {
	const errors: ParseError[] = []
	let portfolioId: string | null = null
	let extractDate: Date | null = null

	try {
		// Extract Portfolio ID from B1
		const portfolioIdCell = worksheet.getCell('B1')
		const portfolioIdValue = extractStringValue(portfolioIdCell, 'B', 1, true)
		
		if (!portfolioIdValue || portfolioIdValue.trim() === '') {
			errors.push(createCellExtractionError(
				'Portfolio ID (cell B1) is required but not found',
				'B',
				1,
				portfolioIdValue,
				'ERROR'
			))
		} else {
			portfolioId = portfolioIdValue.trim()
		}

		// Extract Date from B5
		const extractDateCell = worksheet.getCell('B5')
		const parsedDateValue = extractDateValue(extractDateCell, 'B', 5)
		
		if (!parsedDateValue) {
			errors.push(createCellExtractionError(
				'Extract Date (cell B5) is required but not found or invalid',
				'B',
				5,
				extractDateCell.value,
				'ERROR'
			))
		} else {
			// Use transformer to validate and normalize the date
			const dateTransformation = transformExtractionDate(parsedDateValue)
			errors.push(...dateTransformation.errors.map(error => ({
				...error,
				rowNumber: 5,
				columnLetter: 'B',
				cellAddress: 'B5'
			})))
			
			extractDate = dateTransformation.result
		}

	} catch (error) {
		errors.push({
			type: 'SPECIAL_CELLS',
			message: `Error extracting special cells: ${error}`,
			severity: 'ERROR'
		})
	}

	return {
		portfolioId,
		extractDate,
		errors
	}
}

/**
 * Create a failed parse result
 */
function createFailedResult(errors: ParseError[], startTime: Date): ParseResult {
	const endTime = new Date()
	
	return {
		success: false,
		portfolioId: null,
		extractDate: null,
		records: [],
		errors,
		stats: {
			totalRows: 0,
			processedRows: 0,
			skippedRows: 0,
			errorRows: 0,
			emptyRows: 0,
			startTime,
			endTime,
			processingTimeMs: endTime.getTime() - startTime.getTime()
		}
	}
}

/**
 * Quick validation function that just checks if file can be parsed
 */
export async function canParseExcelFile(filePath: string): Promise<{
	canParse: boolean
	errors: string[]
}> {
	try {
		// Use existing structure validation
		const validation = await validateExcelStructure(filePath)
		
		return {
			canParse: validation.isValid,
			errors: validation.errors.map(error => error.message)
		}
	} catch (error) {
		return {
			canParse: false,
			errors: [`Cannot read Excel file: ${error}`]
		}
	}
}

/**
 * Extract only special cells without full parsing (for quick metadata)
 */
export async function extractMetadata(filePath: string): Promise<{
	portfolioId: string | null
	extractDate: Date | null
	errors: string[]
}> {
	try {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(filePath)
		
		const worksheet = workbook.getWorksheet(1)
		if (!worksheet) {
			return {
				portfolioId: null,
				extractDate: null,
				errors: ['No worksheet found in Excel file']
			}
		}

		const result = extractSpecialCells(worksheet)
		
		return {
			portfolioId: result.portfolioId,
			extractDate: result.extractDate,
			errors: result.errors.map(error => error.message)
		}
	} catch (error) {
		return {
			portfolioId: null,
			extractDate: null,
			errors: [`Error reading Excel file: ${error}`]
		}
	}
} 