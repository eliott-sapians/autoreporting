/**
 * Data layer exports for portfolio management
 * Central export point for all data-related functionality
 */

// Main data access layer exports

// Core data services
export { PortfolioDataService } from './portfolio-service'

// Custom hooks
export { usePortfolioData, useRawPortfolioData } from './hooks/use-portfolio-data'

// Data transformers - Basic
export {
	transformToTotalData,
	transformToFundData,
	transformToProvisionData,
	transformToExtendedFundData
} from './transformers'

// Data transformers - Slide-specific
export {
	transformToGardeData,
	transformToSyntheseData,
	transformToZoomData,
	transformToDetailData,
	transformToPerformanceData
} from './transformers'

// Data transformers - Allocation and filtering
export {
	getStrategyAllocation,
	getBucketAllocation,
	getFundsByStrategy,
	getFundsByBucket
} from './transformers'

// Type definitions
export * from './slide-interfaces'

// Legacy interfaces (maintained for backward compatibility)
export * from './slide-interfaces' 