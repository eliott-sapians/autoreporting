/**
 * Safe cell value extraction utilities for ExcelJS
 * Handles different cell types: number, string, date, formula, richText
 */

import ExcelJS from 'exceljs'
import type { CellExtractionResult, ParseError } from '@/lib/excel/types/parser'

/**
 * Safely extract value from an ExcelJS cell
 */
export function extractCellValue(
	cell: ExcelJS.Cell,
	columnLetter: string,
	rowNumber: number
): CellExtractionResult {
	try {
		// Handle null/undefined cells
		if (!cell || cell.value === null || cell.value === undefined) {
			return {
				value: null,
				isFormula: false,
				isEmpty: true
			}
		}

		// Handle different cell value types
		const cellValue = cell.value

		// Formula cells - extract calculated result
		if (typeof cellValue === 'object' && cellValue !== null && 'result' in cellValue) {
			const formulaCell = cellValue as ExcelJS.CellFormulaValue
			return {
				value: formulaCell.result,
				isFormula: true,
				isEmpty: formulaCell.result === null || formulaCell.result === undefined
			}
		}

		// Rich text cells - extract text content
		if (typeof cellValue === 'object' && cellValue !== null && 'richText' in cellValue) {
			const richTextCell = cellValue as ExcelJS.CellRichTextValue
			const textContent = richTextCell.richText.map(segment => segment.text).join('')
			return {
				value: textContent,
				isFormula: false,
				isEmpty: textContent.trim() === ''
			}
		}

		// Hyperlink cells - extract text content
		if (typeof cellValue === 'object' && cellValue !== null && 'text' in cellValue) {
			const hyperlinkCell = cellValue as ExcelJS.CellHyperlinkValue
			return {
				value: hyperlinkCell.text,
				isFormula: false,
				isEmpty: !hyperlinkCell.text || hyperlinkCell.text.trim() === ''
			}
		}

		// Error cells
		if (typeof cellValue === 'object' && cellValue !== null && 'error' in cellValue) {
			const errorCell = cellValue as ExcelJS.CellErrorValue
			return {
				value: null,
				isFormula: false,
				isEmpty: true,
				error: `Excel cell error: ${errorCell.error}`
			}
		}

		// Standard primitive values (string, number, boolean, Date)
		const isEmpty = cellValue === '' || cellValue === 0 && cell.text === ''
		
		return {
			value: cellValue,
			isFormula: false,
			isEmpty
		}

	} catch (error) {
		return {
			value: null,
			isFormula: false,
			isEmpty: true,
			error: `Error extracting cell ${columnLetter}${rowNumber}: ${error}`
		}
	}
}

/**
 * Extract string value from cell with normalization
 */
export function extractStringValue(
	cell: ExcelJS.Cell,
	columnLetter: string,
	rowNumber: number,
	trim: boolean = true
): string | null {
	const result = extractCellValue(cell, columnLetter, rowNumber)
	
	if (result.isEmpty || result.value === null || result.value === undefined) {
		return null
	}

	// Convert to string
	let stringValue: string
	if (typeof result.value === 'string') {
		stringValue = result.value
	} else if (typeof result.value === 'number') {
		stringValue = result.value.toString()
	} else if (result.value instanceof Date) {
		stringValue = result.value.toISOString()
	} else if (typeof result.value === 'boolean') {
		stringValue = result.value.toString()
	} else {
		stringValue = String(result.value)
	}

	// Apply trimming if requested
	return trim ? stringValue.trim() : stringValue
}

/**
 * Extract numeric value from cell
 */
export function extractNumericValue(
	cell: ExcelJS.Cell,
	columnLetter: string,
	rowNumber: number
): number | null {
	const result = extractCellValue(cell, columnLetter, rowNumber)
	
	if (result.isEmpty || result.value === null || result.value === undefined) {
		return null
	}

	// Handle numeric values
	if (typeof result.value === 'number') {
		return isNaN(result.value) ? null : result.value
	}

	// Handle string representations of numbers
	if (typeof result.value === 'string') {
		// Remove common formatting (spaces, commas)
		const cleanedString = result.value.trim().replace(/[\s,]/g, '')
		
		// Handle empty string after cleaning
		if (cleanedString === '') {
			return null
		}

		// Handle percentage strings
		if (cleanedString.endsWith('%')) {
			const percentValue = parseFloat(cleanedString.slice(0, -1))
			return isNaN(percentValue) ? null : percentValue / 100
		}

		// Parse as float
		const numericValue = parseFloat(cleanedString)
		return isNaN(numericValue) ? null : numericValue
	}

	// Cannot convert to number
	return null
}

/**
 * Extract date value from cell
 */
export function extractDateValue(
	cell: ExcelJS.Cell,
	columnLetter: string,
	rowNumber: number
): Date | null {
	const result = extractCellValue(cell, columnLetter, rowNumber)
	
	if (result.isEmpty || result.value === null || result.value === undefined) {
		return null
	}

	// Handle Date objects
	if (result.value instanceof Date) {
		return isNaN(result.value.getTime()) ? null : result.value
	}

	// Handle Excel date serial numbers
	if (typeof result.value === 'number') {
		try {
			// Excel stores dates as serial numbers (days since 1900-01-01)
			const excelEpoch = new Date(1900, 0, 1)
			const serialDate = new Date(excelEpoch.getTime() + (result.value - 1) * 24 * 60 * 60 * 1000)
			return isNaN(serialDate.getTime()) ? null : serialDate
		} catch {
			return null
		}
	}

	// Handle string dates
	if (typeof result.value === 'string') {
		try {
			const parsedDate = new Date(result.value.trim())
			return isNaN(parsedDate.getTime()) ? null : parsedDate
		} catch {
			return null
		}
	}

	return null
}

/**
 * Create a parse error for cell extraction failures
 */
export function createCellExtractionError(
	message: string,
	columnLetter: string,
	rowNumber: number,
	originalValue?: any,
	severity: 'ERROR' | 'WARNING' = 'ERROR'
): ParseError {
	return {
		type: 'CELL_EXTRACTION',
		message,
		columnLetter,
		rowNumber,
		cellAddress: `${columnLetter}${rowNumber}`,
		originalValue,
		severity
	}
} 