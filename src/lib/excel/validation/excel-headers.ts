/**
 * Excel Header Validation
 * Validates the 11 French column headers at row 9
 */

import type { Worksheet } from 'exceljs'
import { 
	EXPECTED_HEADERS, 
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
 * Validate Excel headers at row 9
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
				severity: 'ERROR'
			})
		}
		
		// Validate each header
		COLUMN_LETTERS.forEach((columnLetter) => {
			const expectedHeader = EXPECTED_HEADERS[columnLetter]
			const cellAddress = `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`
			
			try {
				const cell = worksheet.getCell(cellAddress)
				const actualHeader = cell.value
				
				// Check if header is missing
				if (!actualHeader) {
					errors.push({
						type: 'HEADER',
						message: `Missing header in column ${columnLetter}. Expected "${expectedHeader}"`,
						cellReference: cellAddress,
						columnLetter,
						severity: 'ERROR'
					})
					return
				}
				
				// Convert to string and trim
				const actualHeaderStr = String(actualHeader).trim()
				
				// Check exact match (case-sensitive)
				if (actualHeaderStr !== expectedHeader) {
					errors.push({
						type: 'HEADER',
						message: ERROR_MESSAGES.INVALID_HEADER(columnLetter, expectedHeader, actualHeaderStr),
						cellReference: cellAddress,
						columnLetter,
						severity: 'ERROR'
					})
				} else {
					// Valid header - add to mapping
					columnMapping[columnLetter] = expectedHeader
				}
				
			} catch (cellError) {
				errors.push({
					type: 'HEADER',
					message: `Error reading header in column ${columnLetter}: ${cellError}`,
					cellReference: cellAddress,
					columnLetter,
					severity: 'ERROR'
				})
			}
		})
		
		// Check for extra columns beyond K
		const maxColumn = headerRow.cellCount
		if (maxColumn > EXPECTED_COLUMN_COUNT) {
			errors.push({
				type: 'STRUCTURE',
				message: `Extra columns detected. Expected exactly ${EXPECTED_COLUMN_COUNT} columns (A-K)`,
				rowNumber: SPECIAL_CELLS.HEADER_ROW,
				severity: 'ERROR'
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
		isValid: errors.length === 0,
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
 * Validate specific header in a column
 */
export function validateSingleHeader(
	worksheet: Worksheet, 
	columnLetter: ColumnLetter, 
	context: ValidationContext
): ValidationError | null {
	try {
		const expectedHeader = EXPECTED_HEADERS[columnLetter]
		const cellAddress = `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`
		const cell = worksheet.getCell(cellAddress)
		const actualHeader = normalizeHeader(cell.value)
		
		if (actualHeader !== expectedHeader) {
			return {
				type: 'HEADER',
				message: ERROR_MESSAGES.INVALID_HEADER(columnLetter, expectedHeader, actualHeader),
				cellReference: cellAddress,
				columnLetter,
				severity: 'ERROR'
			}
		}
		
		return null
	} catch (error) {
		return {
			type: 'HEADER',
			message: `Error validating header in column ${columnLetter}: ${error}`,
			cellReference: `${columnLetter}${SPECIAL_CELLS.HEADER_ROW}`,
			columnLetter,
			severity: 'ERROR'
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