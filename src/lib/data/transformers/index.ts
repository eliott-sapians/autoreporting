/**
 * Main transformers export file
 * Central access point for all data transformation functions
 */

// Constants and utilities
export { BUCKET_MAPPING, mapToBucketCode, COLOR_SCHEMES } from './constants'
export { 
	formatCurrency, 
	formatPercentage, 
	calculatePortfolioPerformance, 
	calculateFundPerformance 
} from './utils'

// Basic transformers (legacy support)
export {
	transformToTotalData,
	transformToFundData,
	transformToProvisionData,
	transformToExtendedFundData
} from './basic-transformers'

// Allocation and filtering transformers
export {
	getFundsByStrategy,
	getStrategyAllocation,
	getBucketAllocation,
	getFundsByBucket
} from './allocation-transformers'

// Main slide transformers (slides 1-3)
export {
	transformToGardeData,
	transformToSyntheseData,
	transformToZoomData
} from './slide-transformers'

// Bucket detail transformers (slides 4-6) + legacy
export {
	transformToCTBucketData,
	transformToLTLBucketData,
	transformToLTIBucketData,
	transformToDetailData,
	transformToPerformanceData,
	computeEngagementTVPI
} from './bucket-transformers' 