/**
 * Excel Header Validation
 * Validates that headers exist at row 9 (soft validation)
 */

import type { Worksheet } from 'exceljs'
import { 
	COLUMN_LETTERS, 
	SPECIAL_CELLS, 
	EXPECTED_COLUMN_COUNT,
	type ColumnLetter
} from '@/lib/excel/constants/columns'
import { ERROR_MESSAGES } from '@/lib/excel/constants/validation-rules'
import type { 
	ValidationError, 
	ValidationContext, 
	HeaderValidationResult
} from '@/lib/excel/types/excel-format'

/**
 * Validate Excel headers at row 9 (soft validation - just check they exist)
 */
export function validateHeaders(worksheet: Worksheet, context: ValidationContext): HeaderValidationResult {
	const errors: ValidationError[] = []
	const columnMapping: Partial<Record<ColumnLetter, any>> = {}
	
	try {
		// Get the header row
		const headerRow = worksheet.getRow(SPECIAL_CELLS.HEADER_ROW)
		
		// Check column count
		const actualColumnCount = headerRow.actualCellCount
		if (actualColumnCount !== EXPECTED_COLUMN_COUNT) {
			errors.push({
				type: 'STRUCTURE',
				message: ERROR_MESSAGES.INVALID_COLUMN_COUNT(actualColumnCount, EXPECTED_COLUMN_COUNT),
				rowNumber: SPECIAL_CELLS.HEADER_ROW,
				severity: 'WARNING' // Downgraded from ERROR to WARNING
			})
		}
		
		// Validate each header (soft validation - just check they exist)
		COLUMN_LETTERS.forEach((columnLetter) => {
			const cellAddress = `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`
			
			try {
				const cell = worksheet.getCell(cellAddress)
				const actualHeader = cell.value
				
				// Check if header is missing
				if (!actualHeader) {
					errors.push({
						type: 'HEADER',
						message: `Missing header in column ${columnLetter}`,
						cellReference: cellAddress,
						columnLetter,
						severity: 'WARNING' // Downgraded from ERROR to WARNING
					})
					return
				}
				
				// Convert to string and add to mapping (no validation of content)
				const actualHeaderStr = String(actualHeader).trim()
				columnMapping[columnLetter] = actualHeaderStr
				
			} catch (cellError) {
				errors.push({
					type: 'HEADER',
					message: `Error reading header in column ${columnLetter}: ${cellError}`,
					cellReference: cellAddress,
					columnLetter,
					severity: 'WARNING'
				})
			}
		})
		
		// Check for extra columns beyond K (only check actualCellCount - cells with data)
		const maxColumn = headerRow.actualCellCount
		if (maxColumn > EXPECTED_COLUMN_COUNT) {
			errors.push({
				type: 'STRUCTURE',
				message: `Extra columns detected. Expected exactly ${EXPECTED_COLUMN_COUNT} columns (A-K)`,
				rowNumber: SPECIAL_CELLS.HEADER_ROW,
				severity: 'WARNING'
			})
		}
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error validating headers: ${error}`,
			rowNumber: SPECIAL_CELLS.HEADER_ROW,
			severity: 'ERROR'
		})
	}
	
	return {
		isValid: errors.filter(e => e.severity === 'ERROR').length === 0, // Only ERROR level issues make it invalid
		errors,
		columnMapping
	}
}

/**
 * Get normalized header value for comparison
 */
function normalizeHeader(header: any): string {
	if (!header) return ''
	return String(header).trim()
}

/**
 * Validate specific header in a column (soft validation)
 */
export function validateSingleHeader(
	worksheet: Worksheet, 
	columnLetter: ColumnLetter, 
	context: ValidationContext
): ValidationError | null {
	try {
		const cellAddress = `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`
		const cell = worksheet.getCell(cellAddress)
		const actualHeader = normalizeHeader(cell.value)
		
		if (!actualHeader) {
			return {
				type: 'HEADER',
				message: `Missing header in column ${columnLetter}`,
				cellReference: cellAddress,
				columnLetter,
				severity: 'WARNING'
			}
		}
		
		return null
	} catch (error) {
		return {
			type: 'HEADER',
			message: `Error validating header in column ${columnLetter}: ${error}`,
			cellReference: `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`,
			columnLetter,
			severity: 'WARNING'
		}
	}
}

/**
 * Get all header values from row 9
 */
export function getHeaderValues(worksheet: Worksheet): Record<string, any> {
	const headers: Record<string, any> = {}
	
	COLUMN_LETTERS.forEach((columnLetter) => {
		try {
			const cellAddress = `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`
			const cell = worksheet.getCell(cellAddress)
			headers[columnLetter] = cell.value
		} catch (error) {
			headers[columnLetter] = null
		}
	})
	
	return headers
} 