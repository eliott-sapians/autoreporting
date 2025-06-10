import { z } from 'zod'
import { FRENCH_NUMBER_UTILS, ERROR_MESSAGES } from '@/lib/excel/constants/validation-rules'

// Custom French number validation function
const frenchNumber = (fieldName: string) => z.union([
	z.number(),
	z.string()
]).refine(
	(val) => FRENCH_NUMBER_UTILS.isValidFrenchNumber(val),
	{
		message: `${fieldName} must be a valid French number (use comma as decimal separator, e.g., "123,45")`
	}
).transform((val) => {
	const parsed = FRENCH_NUMBER_UTILS.parseFrenchNumber(val)
	if (parsed === null) {
		throw new Error(`Invalid French number: ${val}`)
	}
	return parsed
})

// Excel row data validation schema (matches the 11 business columns)
export const excelRowSchema = z.object({
	balance: frenchNumber('Balance'),
	label: z.string().min(1, 'Label is required'),
	currency: z.string().length(3, 'Currency must be exactly 3 characters'),
	valuationEur: frenchNumber('Valuation EUR'),
	weightPct: frenchNumber('Weight percentage'),
	isin: z.string().max(12, 'ISIN cannot exceed 12 characters').optional(),
	bookPriceEur: frenchNumber('Book price EUR'),
	feesEur: frenchNumber('Fees EUR'),
	assetName: z.string().min(1, 'Asset name is required'),
	strategy: z.string().min(1, 'Strategy is required'),
	bucket: z.string().min(1, 'Bucket is required')
})

// Portfolio data validation schema
export const portfolioDataSchema = z.object({
	portfolioId: z.string().uuid('Portfolio ID must be a valid UUID'),
	extractDate: z.string().refine(val => !isNaN(Date.parse(val)), {
		message: 'Extract date must be a valid date'
	}),
	rows: z.array(excelRowSchema).min(1, 'At least one data row is required')
})

// Database insert schema
export const portfolioInsertSchema = z.object({
	name: z.string().optional(),
	client_email: z.string().email('Must be a valid email address')
})

export const portfolioDataInsertSchema = z.object({
	portfolio_id: z.string().uuid(),
	extract_date: z.string().refine(val => !isNaN(Date.parse(val))),
	balance: frenchNumber('Balance'),
	label: z.string(),
	currency: z.string().length(3),
	valuation_eur: frenchNumber('Valuation EUR'),
	weight_pct: frenchNumber('Weight percentage'),
	isin: z.string().max(12).optional(),
	pnl_eur: frenchNumber('PnL EUR'),
	fees_eur: frenchNumber('Fees EUR'),
	asset_name: z.string(),
	strategy: z.string(),
	bucket: z.string()
})

export type ExcelRowData = z.infer<typeof excelRowSchema>
export type PortfolioDataInput = z.infer<typeof portfolioDataSchema> 