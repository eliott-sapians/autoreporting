/**
 * Constants and mappings for data transformations
 */

/**
 * Bucket mapping constants
 * Maps database bucket values to display names and codes
 */
export const BUCKET_MAPPING = {
	CT: {
		code: 'CT',
		name: 'Long terme provision',
		dbValues: ['CT', 'Provision'] // Database values that map to this bucket
	},
	LTL: {
		code: 'LTL', 
		name: 'Long terme liquide',
		dbValues: ['LTL', 'Liquide'] // Database values that map to this bucket
	},
	LTI: {
		code: 'LTI',
		name: 'Long terme illiquide', 
		dbValues: ['LTI', 'Illiquide'] // Database values that map to this bucket
	}
} as const

/**
 * Map database bucket value to our standard bucket code
 */
export function mapToBucketCode(dbBucket: string | null): keyof typeof BUCKET_MAPPING | null {
	if (!dbBucket) return null
	
	for (const [bucketCode, config] of Object.entries(BUCKET_MAPPING)) {
		if (config.dbValues.some(val => val.toLowerCase() === dbBucket.toLowerCase())) {
			return bucketCode as keyof typeof BUCKET_MAPPING
		}
	}
	
	return null
}

/**
 * Default color schemes for charts
 */
export const COLOR_SCHEMES = {
	buckets: {
		'CT': '#F4F3EE',
		'LTL': '#D8D8D8', 
		'LTI': '#A1DFF0',
	},
	strategies: {
		'Cash': '#C5C5B4', // rgb(197,197,180)
		'Obligations': '#A55FD7', // Fallback lavender
		'Monétaire': '#003C62', // rgb(0,60,98)
		'Private equity': '#FF6E1E', // rgb(255,110,30)
		'Dette Privée': '#8E3200', // rgb(142,50,0)
		'Infras': '#FF9961', // rgb(255, 153, 97)
		'Club Deal': '#FFC72C', // Orange Yellow
		'Actions': '#46CDA9', // rgb(70,205,169)
		'Crypto': '#FFFF69', // rgb(255,255,105)
		'Commodités': '#009678', // rgb(0,150,120)
		'Produit Structuré': '#009678', // rgb(0,150,120)
		'Unknown': '#6b7280'
	}
} as const 

/* ------------------------------------------------------------------
 * Strategy → colour helper
 * ------------------------------------------------------------------
 * Recharts SVG <path fill="…"> cannot resolve CSS custom properties,
 * donc on retourne systématiquement un code HEX/RGB.  Pour éviter de
 * dupliquer la palette, on indexe COLOR_SCHEMES.strategies par une clé
 * normalisée (minuscules, sans accents, sans espaces) au premier import.
 */

// Build a fast lookup table once at module load.
const STRATEGY_COLOR_INDEX: Record<string, string> = (() => {
	const index: Record<string, string> = {}
	for (const [name, color] of Object.entries(COLOR_SCHEMES.strategies)) {
		const normalized = name
			.normalize('NFD')
			.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // strip control chars
			.replace(/[\u0300-\u036f]/g, '') // strip diacritics
			.toLowerCase()
			.replace(/\s+/g, '')
			.replace(/[^a-z]/g, '') // keep letters only for stability
		index[normalized] = color as string
	}
	return index
})()

/**
 * Return the colour associated with a fund strategy.  Fallback = Unknown.
 */
export function getStrategyColor(strategy: string | null | undefined): string {
	if (!strategy || strategy.trim() === '') {
		return COLOR_SCHEMES.strategies['Unknown']
	}
	const normalized = strategy
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, '')
		.replace(/[^a-z]/g, '')
	return STRATEGY_COLOR_INDEX[normalized] || COLOR_SCHEMES.strategies['Unknown']
} 