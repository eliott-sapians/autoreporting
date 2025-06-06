/**
 * Data layer exports for portfolio management
 * Central export point for all data-related functionality
 */

// Core database service
export { portfolioService, PortfolioDataService } from './portfolio-service'

// Data transformation utilities
export * from './transformers'

// React hooks for API data fetching
export * from './hooks/use-portfolio-data'

// Legacy interfaces (maintained for backward compatibility)
export * from './slide-interfaces' 