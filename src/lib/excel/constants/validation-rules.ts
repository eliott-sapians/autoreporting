/**
 * Validation Rules and Constants
 * Define validation constraints for Excel file processing
 */

// Numeric precision rules
export const NUMERIC_RULES = {
	BALANCE: { precision: 18, scale: 2 },
	VALUATION_EUR: { precision: 18, scale: 2 },
	WEIGHT_PCT: { precision: 6, scale: 3 },
	BOOK_PRICE_EUR: { precision: 18, scale: 2 },
	FEES_EUR: { precision: 18, scale: 2 }
} as const

// String length constraints
export const STRING_RULES = {
	CURRENCY_LENGTH: 3,
	ISIN_LENGTH: 12,
	MAX_TEXT_LENGTH: 500
} as const

// Currency validation
export const VALID_CURRENCIES = [
	'EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'SEK', 'NOK', 'DKK'
] as const

// ISIN validation pattern (basic format check)
export const ISIN_PATTERN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/

// Date validation rules
export const DATE_RULES = {
	MIN_YEAR: 2000,
	MAX_YEAR: 2050,
	ALLOWED_FORMATS: ['DD/MM/YYYY'] as const
} as const

// Portfolio ID validation
export const PORTFOLIO_ID_RULES = {
	MIN_LENGTH: 1,
	MAX_LENGTH: 100,
	PATTERN: /^[a-zA-Z0-9\-_]+$/ // Alphanumeric, hyphens, underscores
} as const

// File validation rules
export const FILE_RULES = {
	MAX_SIZE_MB: 50,
	MIN_DATA_ROWS: 1,
	MAX_DATA_ROWS: 50
} as const

// Error message templates
export const ERROR_MESSAGES = {
	MISSING_PORTFOLIO_ID: 'Portfolio ID is required in cell B1',
	MISSING_EXTRACT_DATE: 'Extract date is required in cell B5',
	INVALID_HEADER: (column: string, expected: string, actual: string) => 
		`Invalid header in column ${column}. Expected "${expected}", got "${actual}"`,
	INVALID_COLUMN_COUNT: (actual: number, expected: number) => 
		`Invalid column count. Expected ${expected}, got ${actual}`,
	INVALID_CURRENCY: (value: string) => 
		`Invalid currency code "${value}". Must be 3 characters`,
	INVALID_ISIN: (value: string) => 
		`Invalid ISIN code "${value}". Must follow ISIN format`,
	INVALID_NUMERIC: (column: string, value: any) => 
		`Invalid numeric value in column ${column}: "${value}"`,
	INVALID_DATE: (value: any) => 
		`Invalid date format: "${value}"`,
	FILE_TOO_LARGE: (sizeMB: number) => 
		`File size ${sizeMB}MB exceeds maximum allowed size of ${FILE_RULES.MAX_SIZE_MB}MB`,
	NO_DATA_ROWS: 'No data rows found starting from row 10'
} as const

export type Currency = typeof VALID_CURRENCIES[number] 