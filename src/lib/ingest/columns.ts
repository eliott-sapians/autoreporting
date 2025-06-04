// Excel column mappings from README.md specification
// Headers are at row 9, Portfolio ID at B1, Extract Date at B5

export const EXCEL_CONFIG = {
	PORTFOLIO_ID_CELL: 'B1',
	EXTRACT_DATE_CELL: 'B5',
	HEADER_ROW: 9,
	DATA_START_ROW: 10,
	COLUMN_COUNT: 11
} as const

export const COLUMN_MAPPINGS = {
	A: 'balance',        // Solde
	B: 'label',          // Libellé
	C: 'currency',       // Devise
	D: 'valuationEur',   // Estimation + int. courus (EUR)
	E: 'weightPct',      // Poids (%)
	F: 'isin',           // Code ISIN
	G: 'bookPriceEur',   // B / P - Total (EUR)
	H: 'feesEur',        // Frais (EUR)
	I: 'assetName',      // Nom
	J: 'strategy',       // Stratégie
	K: 'bucket'          // Poche
} as const

export const EXPECTED_HEADERS = [
	'Solde',
	'Libellé',
	'Devise',
	'Estimation + int. courus (EUR)',
	'Poids (%)',
	'Code ISIN',
	'B / P - Total (EUR)',
	'Frais (EUR)',
	'Nom',
	'Stratégie',
	'Poche'
] as const

// Type definitions
export type ColumnMapping = typeof COLUMN_MAPPINGS
export type ColumnKey = keyof ColumnMapping
export type BusinessField = ColumnMapping[ColumnKey] 