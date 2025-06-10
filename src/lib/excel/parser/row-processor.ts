/**
 * Row processing logic for Excel parsing
 * Maps Excel columns A-K to database fields with transformation
 */

import ExcelJS from 'exceljs'
import { COLUMN_LETTERS, COLUMN_TO_FIELD_MAP } from '@/lib/excel/constants/columns'
import { extractCellValue } from './cell-extractor'
import {
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
	transformBucket
} from './data-transformer'
import type { 
	ParsedRowData, 
	RowProcessingResult, 
	ParseError, 
	TransformationOptions 
} from '@/lib/excel/types/parser'
import { DEFAULT_TRANSFORMATION_OPTIONS } from '@/lib/excel/types/parser'

/**
 * Process a single Excel row into typed data
 */
export function processDataRow(
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): RowProcessingResult {
	const errors: ParseError[] = []
	
	try {
		// Get the row
		const row = worksheet.getRow(rowNumber)
		
		// Check if row is completely empty
		if (isRowEmpty(row)) {
			return {
				success: true,
				data: null,
				errors: [],
				isEmpty: true
			}
		}

		// Initialize row data structure
		const rowData: ParsedRowData = {
			rowNumber,
			balance: null,
			label: null,
			currency: null,
			valuation_eur: null,
			weight_pct: null,
			isin: null,
			pnl_eur: null,
			fees_eur: null,
			asset_name: null,
			strategy: null,
			bucket: null
		}

		// Process each column
		for (const columnLetter of COLUMN_LETTERS) {
			const columnIndex = columnLetter.charCodeAt(0) - 64 // A=1, B=2, etc.
			const cell = row.getCell(columnIndex)
			const fieldName = COLUMN_TO_FIELD_MAP[columnLetter]

			// Extract cell value
			const extraction = extractCellValue(cell, columnLetter, rowNumber)
			
			// Handle extraction errors
			if (extraction.error) {
				errors.push({
					type: 'CELL_EXTRACTION',
					message: extraction.error,
					rowNumber,
					columnLetter,
					cellAddress: `${columnLetter}${rowNumber}`,
					originalValue: extraction.value,
					severity: 'ERROR'
				})
				continue
			}

			// Transform the value based on column type
			const transformation = transformColumnValue(
				fieldName,
				extraction.value,
				options,
				columnLetter,
				rowNumber
			)

			// Add transformation errors
			errors.push(...transformation.errors.map(error => ({
				...error,
				rowNumber,
				columnLetter,
				cellAddress: `${columnLetter}${rowNumber}`
			})))

			// Assign transformed value to row data
			;(rowData as any)[fieldName] = transformation.result
		}

		// Determine if processing was successful
		const hasErrors = errors.some(error => error.severity === 'ERROR')
		
		return {
			success: !hasErrors,
			data: rowData,
			errors,
			isEmpty: false
		}

	} catch (error) {
		// Handle unexpected errors
		errors.push({
			type: 'ROW_PROCESSING',
			message: `Unexpected error processing row ${rowNumber}: ${error}`,
			rowNumber,
			severity: 'ERROR'
		})

		return {
			success: false,
			data: null,
			errors,
			isEmpty: false
		}
	}
}

/**
 * Transform a cell value based on its target database field
 */
function transformColumnValue(
	fieldName: string,
	value: any,
	options: TransformationOptions,
	columnLetter: string,
	rowNumber: number
): { result: any; errors: ParseError[] } {
	
	switch (fieldName) {
		case 'balance':
			return transformBalance(value, options)
		
		case 'label':
			return transformLabel(value, options)
		
		case 'currency':
			return transformCurrency(value, options)
		
		case 'valuation_eur':
			return transformValuationEur(value, options)
		
		case 'weight_pct':
			return transformWeightPct(value, options)
		
		case 'isin':
			return transformISIN(value, options)
		
		case 'pnl_eur':
			return transformBookPriceEur(value, options)
		
		case 'fees_eur':
			return transformFeesEur(value, options)
		
		case 'asset_name':
			return transformAssetName(value, options)
		
		case 'strategy':
			return transformStrategy(value, options)
		
		case 'bucket':
			return transformBucket(value, options)
		
		default:
			return {
				result: null,
				errors: [{
					type: 'ROW_PROCESSING',
					message: `Unknown field name: ${fieldName}`,
					rowNumber,
					columnLetter,
					cellAddress: `${columnLetter}${rowNumber}`,
					originalValue: value,
					severity: 'ERROR'
				}]
			}
	}
}

/**
 * Check if a row is completely empty
 */
function isRowEmpty(row: ExcelJS.Row): boolean {
	try {
		// Check if row exists and has cells
		if (!row || row.cellCount === 0) {
			return true
		}

		// Check each cell for content
		for (let colNum = 1; colNum <= 11; colNum++) { // A-K columns
			const cell = row.getCell(colNum)
			
			if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
				// Handle formula cells
				if (typeof cell.value === 'object' && 'result' in cell.value) {
					const formulaCell = cell.value as ExcelJS.CellFormulaValue
					if (formulaCell.result !== null && formulaCell.result !== undefined && formulaCell.result !== '') {
						return false
					}
				} else {
					return false
				}
			}
		}

		return true
	} catch {
		// If we can't determine, assume it's not empty to be safe
		return false
	}
}

/**
 * Validate that a processed row has required fields
 */
export function validateProcessedRow(
	rowData: ParsedRowData,
	strictValidation: boolean = false
): ParseError[] {
	const errors: ParseError[] = []

	// Check for completely empty rows (all fields null)
	const hasAnyData = Object.entries(rowData).some(([key, value]) => 
		key !== 'rowNumber' && value !== null && value !== undefined
	)

	if (!hasAnyData) {
		return errors // Empty rows are valid, will be filtered out
	}

	// In strict mode, check for required fields
	if (strictValidation) {
		// These fields are commonly expected to have values in portfolio data
		const importantFields = ['label', 'asset_name']
		
		for (const field of importantFields) {
			const value = (rowData as any)[field]
			if (!value || (typeof value === 'string' && value.trim() === '')) {
				errors.push({
					type: 'ROW_PROCESSING',
					message: `Missing important field: ${field}`,
					rowNumber: rowData.rowNumber,
					severity: 'WARNING'
				})
			}
		}
	}

	return errors
}

/**
 * Process multiple rows efficiently
 */
export function processDataRows(
	worksheet: ExcelJS.Worksheet,
	startRow: number,
	endRow: number,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS,
	skipEmptyRows: boolean = true
): {
	processedRows: ParsedRowData[]
	allErrors: ParseError[]
	stats: {
		totalRows: number
		processedRows: number
		skippedRows: number
		errorRows: number
		emptyRows: number
	}
} {
	const processedRows: ParsedRowData[] = []
	const allErrors: ParseError[] = []
	
	let processedCount = 0
	let skippedCount = 0
	let errorCount = 0
	let emptyCount = 0

	for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
		const result = processDataRow(worksheet, rowNumber, options)
		
		// Collect all errors
		allErrors.push(...result.errors)
		
		if (result.isEmpty) {
			emptyCount++
			if (skipEmptyRows) {
				skippedCount++
				continue
			}
		}

		if (result.success && result.data) {
			processedRows.push(result.data)
			processedCount++
		} else {
			errorCount++
			// Still include the row data if it exists, even with errors
			if (result.data) {
				processedRows.push(result.data)
			}
		}
	}

	return {
		processedRows,
		allErrors,
		stats: {
			totalRows: endRow - startRow + 1,
			processedRows: processedCount,
			skippedRows: skippedCount,
			errorRows: errorCount,
			emptyRows: emptyCount
		}
	}
} 