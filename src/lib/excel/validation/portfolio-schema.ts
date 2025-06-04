import { z } from 'zod'

// Excel row data validation schema (matches the 11 business columns)
export const excelRowSchema = z.object({
	balance: z.string().refine(val => !isNaN(parseFloat(val)), {
		message: 'Balance must be a valid number'
	}),
	label: z.string().min(1, 'Label is required'),
	currency: z.string().length(3, 'Currency must be exactly 3 characters'),
	valuationEur: z.string().refine(val => !isNaN(parseFloat(val)), {
		message: 'Valuation EUR must be a valid number'
	}),
	weightPct: z.string().refine(val => !isNaN(parseFloat(val)), {
		message: 'Weight percentage must be a valid number'
	}),
	isin: z.string().max(12, 'ISIN cannot exceed 12 characters').optional(),
	bookPriceEur: z.string().refine(val => !isNaN(parseFloat(val)), {
		message: 'Book price EUR must be a valid number'
	}),
	feesEur: z.string().refine(val => !isNaN(parseFloat(val)), {
		message: 'Fees EUR must be a valid number'
	}),
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
	balance: z.string().refine(val => !isNaN(parseFloat(val))),
	label: z.string(),
	currency: z.string().length(3),
	valuation_eur: z.string().refine(val => !isNaN(parseFloat(val))),
	weight_pct: z.string().refine(val => !isNaN(parseFloat(val))),
	isin: z.string().max(12).optional(),
	book_price_eur: z.string().refine(val => !isNaN(parseFloat(val))),
	fees_eur: z.string().refine(val => !isNaN(parseFloat(val))),
	asset_name: z.string(),
	strategy: z.string(),
	bucket: z.string()
})

export type ExcelRowData = z.infer<typeof excelRowSchema>
export type PortfolioDataInput = z.infer<typeof portfolioDataSchema> 