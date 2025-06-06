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
		'Core': '#F4F3EE',
		'Satellite': '#D8D8D8',
		'Provision': '#A1DFF0',
		'Long-terme': '#3b82f6',
		'Court-terme': '#10b981', 
		'Unknown': '#6b7280'
	},
	strategies: {
		'Cash': '#3b82f6',
		'Obligations': '#10b981',
		'Monétaire': '#f59e0b',
		'Unknown': '#6b7280'
	}
} as const 