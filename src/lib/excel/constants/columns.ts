/**
 * Excel Column Mappings and Headers
 * Based on README.md specification for 11-column format
 */

// Expected headers at row 9 (A9-K9) - Must match exactly
export const EXPECTED_HEADERS = {
	A: 'Solde',                          // balance: numeric(18,2)
	B: 'Libellé',                        // label: text
	C: 'Devise',                         // currency: char(3)
	D: 'Estimation + int. courus (EUR)', // valuation_eur: numeric(18,2)
	E: 'Poids (%)',                      // weight_pct: numeric(6,3)
	F: 'Code ISIN',                      // isin: char(12)
	G: 'B / P - Total (EUR)',            // book_price_eur: numeric(18,2)
	H: 'Frais (EUR)',                    // fees_eur: numeric(18,2)
	I: 'Nom',                            // asset_name: text
	J: 'Stratégie',                      // strategy: text
	K: 'Poche'                           // bucket: text
} as const

// Column letters for iteration
export const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const

// Database field mappings
export const COLUMN_TO_FIELD_MAP = {
	A: 'balance',
	B: 'label',
	C: 'currency',
	D: 'valuation_eur',
	E: 'weight_pct',
	F: 'isin',
	G: 'pnl_eur',
	H: 'fees_eur',
	I: 'asset_name',
	J: 'strategy',
	K: 'bucket'
} as const

// Special cell locations
export const SPECIAL_CELLS = {
	PORTFOLIO_ID: 'B1',
	EXTRACT_DATE: 'B5',
	HEADER_ROW: 9,
	DATA_START_ROW: 10
} as const

// Expected column count
export const EXPECTED_COLUMN_COUNT = 11

// File extensions
export const ALLOWED_EXTENSIONS = ['.xlsx'] as const

export type ColumnLetter = typeof COLUMN_LETTERS[number]
export type HeaderValue = typeof EXPECTED_HEADERS[ColumnLetter]
export type FieldName = typeof COLUMN_TO_FIELD_MAP[ColumnLetter] 