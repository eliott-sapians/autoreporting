/**
 * Data transformation utilities for Excel parsing
 * Handles type conversion, validation, and normalization
 */

import type { TransformationOptions, ParseError } from '@/lib/excel/types/parser'
import { DEFAULT_TRANSFORMATION_OPTIONS } from '@/lib/excel/types/parser'

/**
 * Transform and validate a balance value (numeric)
 */
export function transformBalance(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: number | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		return { result: null, errors }
	}

	// Handle numeric values
	if (typeof value === 'number') {
		if (isNaN(value) || !isFinite(value)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: 'Invalid numeric value for balance',
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}
		return { result: options.normalizeNumbers ? Math.round(value * 100) / 100 : value, errors }
	}

	// Handle string representations
	if (typeof value === 'string') {
		const trimmedValue = options.trimStrings ? value.trim() : value
		if (trimmedValue === '') {
			return { result: null, errors }
		}

		const numericValue = parseFloat(trimmedValue.replace(/[\s,]/g, ''))
		if (isNaN(numericValue)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Cannot convert "${trimmedValue}" to numeric balance`,
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}

		return { result: options.normalizeNumbers ? Math.round(numericValue * 100) / 100 : numericValue, errors }
	}

	// Cannot convert
	errors.push({
		type: 'DATA_TRANSFORMATION',
		message: `Unsupported value type for balance: ${typeof value}`,
		originalValue: value,
		severity: 'ERROR'
	})
	return { result: null, errors }
}

/**
 * Transform and validate a label (text)
 */
export function transformLabel(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		return { result: null, errors }
	}

	// Convert to string
	let stringValue = String(value)
	
	// Apply trimming if requested
	if (options.trimStrings) {
		stringValue = stringValue.trim()
	}

	// Return null for empty strings
	if (stringValue === '') {
		return { result: null, errors }
	}

	return { result: stringValue, errors }
}

/**
 * Transform and validate currency code (3-character string)
 */
export function transformCurrency(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		return { result: null, errors }
	}

	// Convert to string and apply trimming
	let currencyCode = String(value)
	if (options.trimStrings) {
		currencyCode = currencyCode.trim().toUpperCase()
	}

	// Validate currency code format if enabled
	if (options.validateCurrency && currencyCode !== '') {
		if (currencyCode.length !== 3) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Currency code must be exactly 3 characters: "${currencyCode}"`,
				originalValue: value,
				severity: 'WARNING'
			})
		}

		// Basic currency code pattern validation
		if (!/^[A-Z]{3}$/.test(currencyCode)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Invalid currency code format: "${currencyCode}"`,
				originalValue: value,
				severity: 'WARNING'
			})
		}
	}

	return { result: currencyCode === '' ? null : currencyCode, errors }
}

/**
 * Transform and validate valuation EUR (numeric with precision)
 */
export function transformValuationEur(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: number | null; errors: ParseError[] } {
	// Use same logic as balance transformation
	return transformBalance(value, options)
}

/**
 * Transform and validate weight percentage (numeric with 3 decimal places)
 */
export function transformWeightPct(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: number | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		return { result: null, errors }
	}

	// Handle numeric values
	if (typeof value === 'number') {
		if (isNaN(value) || !isFinite(value)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: 'Invalid numeric value for weight percentage',
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}

		// Normalize to 3 decimal places for percentage
		const normalizedValue = options.normalizeNumbers ? Math.round(value * 1000) / 1000 : value
		
		// Validate percentage range (0-100 or 0-1 depending on format)
		if (normalizedValue < 0 || normalizedValue > 100) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Weight percentage out of valid range (0-100): ${normalizedValue}`,
				originalValue: value,
				severity: 'WARNING'
			})
		}

		return { result: normalizedValue, errors }
	}

	// Handle string representations (including percentages)
	if (typeof value === 'string') {
		const trimmedValue = options.trimStrings ? value.trim() : value
		if (trimmedValue === '') {
			return { result: null, errors }
		}

		// Handle percentage format
		let cleanValue = trimmedValue.replace(/[\s,]/g, '')
		let isPercentage = false

		if (cleanValue.endsWith('%')) {
			cleanValue = cleanValue.slice(0, -1)
			isPercentage = true
		}

		const numericValue = parseFloat(cleanValue)
		if (isNaN(numericValue)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Cannot convert "${trimmedValue}" to numeric percentage`,
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}

		// Convert percentage to decimal if needed
		const finalValue = isPercentage ? numericValue / 100 : numericValue
		const normalizedValue = options.normalizeNumbers ? Math.round(finalValue * 1000) / 1000 : finalValue

		return { result: normalizedValue, errors }
	}

	// Cannot convert
	errors.push({
		type: 'DATA_TRANSFORMATION',
		message: `Unsupported value type for weight percentage: ${typeof value}`,
		originalValue: value,
		severity: 'ERROR'
	})
	return { result: null, errors }
}

/**
 * Transform and validate ISIN code (12-character string)
 */
export function transformISIN(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		return { result: null, errors }
	}

	// Convert to string and apply trimming
	let isinCode = String(value)
	if (options.trimStrings) {
		isinCode = isinCode.trim().toUpperCase()
	}

	// Return null for empty strings
	if (isinCode === '') {
		return { result: null, errors }
	}

	// Validate ISIN format if enabled
	if (options.validateISIN) {
		if (isinCode.length !== 12) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `ISIN code must be exactly 12 characters: "${isinCode}"`,
				originalValue: value,
				severity: 'WARNING'
			})
		}

		// Basic ISIN pattern validation (2 letters + 10 alphanumeric)
		if (!/^[A-Z]{2}[A-Z0-9]{10}$/.test(isinCode)) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Invalid ISIN code format: "${isinCode}"`,
				originalValue: value,
				severity: 'WARNING'
			})
		}
	}

	return { result: isinCode, errors }
}

/**
 * Transform book price EUR (same as balance)
 */
export function transformBookPriceEur(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: number | null; errors: ParseError[] } {
	return transformBalance(value, options)
}

/**
 * Transform fees EUR (same as balance)
 */
export function transformFeesEur(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: number | null; errors: ParseError[] } {
	return transformBalance(value, options)
}

/**
 * Transform asset name (same as label)
 */
export function transformAssetName(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	return transformLabel(value, options)
}

/**
 * Transform strategy (same as label)
 */
export function transformStrategy(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	return transformLabel(value, options)
}

/**
 * Transform bucket (same as label)
 */
export function transformBucket(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: string | null; errors: ParseError[] } {
	return transformLabel(value, options)
}

/**
 * Transform extraction date from cell B5
 */
export function transformExtractionDate(
	value: any,
	options: TransformationOptions = DEFAULT_TRANSFORMATION_OPTIONS
): { result: Date | null; errors: ParseError[] } {
	const errors: ParseError[] = []

	if (value === null || value === undefined) {
		errors.push({
			type: 'DATA_TRANSFORMATION',
			message: 'Extraction date is required but not provided',
			originalValue: value,
			severity: 'ERROR'
		})
		return { result: null, errors }
	}

	// Handle Date objects
	if (value instanceof Date) {
		if (isNaN(value.getTime())) {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: 'Invalid date object for extraction date',
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}
		return { result: value, errors }
	}

	// Handle Excel date serial numbers
	if (typeof value === 'number') {
		try {
			const excelEpoch = new Date(1900, 0, 1)
			const serialDate = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000)
			
			if (isNaN(serialDate.getTime())) {
				throw new Error('Invalid serial date')
			}
			
			return { result: serialDate, errors }
		} catch {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Cannot convert serial number "${value}" to date`,
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}
	}

	// Handle string dates
	if (typeof value === 'string') {
		const trimmedValue = options.trimStrings ? value.trim() : value
		
		if (trimmedValue === '') {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: 'Extraction date cannot be empty',
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}

		try {
			const parsedDate = new Date(trimmedValue)
			
			if (isNaN(parsedDate.getTime())) {
				throw new Error('Invalid date format')
			}

			// Validate date is not in future if strict parsing enabled
			if (options.strictDateParsing && parsedDate > new Date()) {
				errors.push({
					type: 'DATA_TRANSFORMATION',
					message: `Extraction date cannot be in the future: ${trimmedValue}`,
					originalValue: value,
					severity: 'WARNING'
				})
			}

			return { result: parsedDate, errors }
		} catch {
			errors.push({
				type: 'DATA_TRANSFORMATION',
				message: `Cannot parse date string "${trimmedValue}"`,
				originalValue: value,
				severity: 'ERROR'
			})
			return { result: null, errors }
		}
	}

	// Cannot convert
	errors.push({
		type: 'DATA_TRANSFORMATION',
		message: `Unsupported value type for extraction date: ${typeof value}`,
		originalValue: value,
		severity: 'ERROR'
	})
	return { result: null, errors }
} 