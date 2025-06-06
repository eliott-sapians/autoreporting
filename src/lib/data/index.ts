/**
 * Data layer exports for portfolio management
 * Central export point for all data-related functionality
 */

// Main data access layer exports

// Core data services
export { PortfolioDataService } from './portfolio-service'

// Custom hooks
export { usePortfolioData, useRawPortfolioData, type UsePortfolioDataReturn } from './hooks/use-portfolio-data'

// Data transformers - All transformers
export {
	// Basic transformers
	transformToTotalData,
	transformToFundData,
	transformToProvisionData,
	transformToExtendedFundData,
	
	// Slide-specific transformers
	transformToGardeData,
	transformToSyntheseData,
	transformToZoomData,
	transformToDetailData,
	transformToPerformanceData,
	computeEngagementTVPI,
	transformToCTBucketData,
	transformToLTLBucketData,
	transformToLTIBucketData,
	
	// Allocation and filtering
	getStrategyAllocation,
	getBucketAllocation,
	getFundsByStrategy,
	getFundsByBucket,
	
	// Constants and utilities
	BUCKET_MAPPING,
	mapToBucketCode,
	COLOR_SCHEMES
} from './transformers/index'

// Type definitions
export * from './slide-interfaces'

// Legacy interfaces (maintained for backward compatibility)
export * from './slide-interfaces' 