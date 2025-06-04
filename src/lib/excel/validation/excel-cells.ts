/**
 * Excel Cell Validation (B1, B5)
 * Validates specific cell requirements for portfolio data
 */

import { z } from 'zod'
import type { Worksheet } from 'exceljs'
import { SPECIAL_CELLS } from '@/lib/excel/constants/columns'
import { PORTFOLIO_ID_RULES, DATE_RULES, ERROR_MESSAGES } from '@/lib/excel/constants/validation-rules'
import type { ValidationError, ValidationContext } from '@/lib/excel/types/excel-format'

// Portfolio ID validation schema
const portfolioIdSchema = z.string()
	.min(PORTFOLIO_ID_RULES.MIN_LENGTH, 'Portfolio ID too short')
	.max(PORTFOLIO_ID_RULES.MAX_LENGTH, 'Portfolio ID too long')
	.regex(PORTFOLIO_ID_RULES.PATTERN, 'Portfolio ID contains invalid characters')

// Date validation schema
const extractDateSchema = z.date({
	required_error: 'Extract date is required',
	invalid_type_error: 'Extract date must be a valid date'
	}).refine((date) => 
	{
		const year = date.getFullYear()
		return year >= DATE_RULES.MIN_YEAR && year <= DATE_RULES.MAX_YEAR
	}, 
	`Date must be between ${DATE_RULES.MIN_YEAR} and ${DATE_RULES.MAX_YEAR}`)

/**
 * Extract and validate Portfolio ID from cell B1
 */
export function validatePortfolioId(worksheet: Worksheet, context: ValidationContext): 
	{
	portfolioId: string | null
	errors: ValidationError[]
	} {
	const errors: ValidationError[] = []
	
	try {
		const cell = worksheet.getCell(SPECIAL_CELLS.PORTFOLIO_ID)
		const rawValue = cell.value
		
		// Check if cell is empty
		if (!rawValue) {
			errors.push({
				type: 'CELL',
				message: ERROR_MESSAGES.MISSING_PORTFOLIO_ID,
				cellReference: SPECIAL_CELLS.PORTFOLIO_ID,
				severity: 'ERROR'
			})
			return { portfolioId: null, errors }
		}
		
		// Convert to string and validate
		const portfolioIdValue = String(rawValue).trim()
		
		// Validate using Zod schema
		const result = portfolioIdSchema.safeParse(portfolioIdValue)
		
		if (!result.success) {
			result.error.issues.forEach(issue => {
				errors.push({
					type: 'CELL',
					message: `Portfolio ID validation error: ${issue.message}`,
					cellReference: SPECIAL_CELLS.PORTFOLIO_ID,
					severity: 'ERROR'
				})
			})
			return { portfolioId: null, errors }
		}
		
		return { portfolioId: result.data, errors }
		
	} catch (error) {
		errors.push({
			type: 'CELL',
			message: `Error reading Portfolio ID from ${SPECIAL_CELLS.PORTFOLIO_ID}: ${error}`,
			cellReference: SPECIAL_CELLS.PORTFOLIO_ID,
			severity: 'ERROR'
		})
		return { portfolioId: null, errors }
	}
}

/**
 * Extract and validate extraction date from cell B5
 */
export function validateExtractDate(worksheet: Worksheet, context: ValidationContext): {
	extractDate: Date | null
	errors: ValidationError[]
} {
	const errors: ValidationError[] = []
	
	try {
		const cell = worksheet.getCell(SPECIAL_CELLS.EXTRACT_DATE)
		const rawValue = cell.value
		
		// Check if cell is empty
		if (!rawValue) {
			errors.push({
				type: 'CELL',
				message: ERROR_MESSAGES.MISSING_EXTRACT_DATE,
				cellReference: SPECIAL_CELLS.EXTRACT_DATE,
				severity: 'ERROR'
			})
			return { extractDate: null, errors }
		}
		
		// Try to parse as date
		let dateValue: Date | null = null
		
		if (rawValue instanceof Date) {
			dateValue = rawValue
		} else if (typeof rawValue === 'string') {
			// Try parsing string date
			dateValue = parseStringDate(rawValue)
		} else if (typeof rawValue === 'number') {
			// Excel serial date number
			dateValue = new Date((rawValue - 25569) * 86400 * 1000)
		}
		
		if (!dateValue || isNaN(dateValue.getTime())) {
			errors.push({
				type: 'CELL',
				message: ERROR_MESSAGES.INVALID_DATE(rawValue),
				cellReference: SPECIAL_CELLS.EXTRACT_DATE,
				severity: 'ERROR'
			})
			return { extractDate: null, errors }
		}
		
		// Validate using Zod schema
		const result = extractDateSchema.safeParse(dateValue)
		
		if (!result.success) {
			result.error.issues.forEach(issue => {
				errors.push({
					type: 'CELL',
					message: `Extract date validation error: ${issue.message}`,
					cellReference: SPECIAL_CELLS.EXTRACT_DATE,
					severity: 'ERROR'
				})
			})
			return { extractDate: null, errors }
		}
		
		return { extractDate: result.data, errors }
		
	} catch (error) {
		errors.push({
			type: 'CELL',
			message: `Error reading extract date from ${SPECIAL_CELLS.EXTRACT_DATE}: ${error}`,
			cellReference: SPECIAL_CELLS.EXTRACT_DATE,
			severity: 'ERROR'
		})
		return { extractDate: null, errors }
	}
}

/**
 * Parse string date in various formats
 */
function parseStringDate(dateString: string): Date | null {
	const trimmed = dateString.trim()
	
	// Try ISO format first
	let date = new Date(trimmed)
	if (!isNaN(date.getTime())) {
		return date
	}
	
	// Try DD/MM/YYYY format
	const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
	if (ddmmyyyy) {
		const [, day, month, year] = ddmmyyyy
		date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
		if (!isNaN(date.getTime())) {
			return date
		}
	}

	return null
}

/**
 * Validate both special cells (B1 and B5)
 */
export function validateSpecialCells(worksheet: Worksheet, context: ValidationContext): {
	portfolioId: string | null
	extractDate: Date | null
	errors: ValidationError[]
} {
	const portfolioResult = validatePortfolioId(worksheet, context)
	const dateResult = validateExtractDate(worksheet, context)
	
	return {
		portfolioId: portfolioResult.portfolioId,
		extractDate: dateResult.extractDate,
		errors: [...portfolioResult.errors, ...dateResult.errors]
	}
} 