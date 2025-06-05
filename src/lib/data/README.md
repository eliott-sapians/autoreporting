# Portfolio Data Transformation Architecture & Core Services

This directory contains the foundational architecture for transforming raw portfolio database data into chart-ready formats for the autoreporting system. This implementation fulfills **Task 1: Data Transformation Architecture & Core Services** from the Linear issue SAP-26.

## Overview

The data transformation system provides a modular, type-safe, and performant architecture for converting raw portfolio data from the database into structured formats required by the slide components. The system includes caching, error handling, French localization, and comprehensive TypeScript interfaces.

## Architecture Components

### 1. Core Data Service (`portfolio-service.ts`)

The `PortfolioDataService` class provides the foundation for all database operations and data retrieval:

```typescript
import { portfolioService } from '@/lib/data/portfolio-service'

// Get portfolio metadata
const portfolio = await portfolioService.getPortfolioMetadata(portfolioId)

// Get latest portfolio data
const latestData = await portfolioService.getLatestPortfolioData(portfolioId)

// Get aggregated data by strategy
const strategyData = await portfolioService.getPortfolioByStrategy(portfolioId)
```

**Key Features:**
- Optimized database queries with Drizzle ORM
- Caching support using React's `cache()` function
- Aggregation queries for strategy and bucket grouping
- Proper TypeScript types and null handling

### 2. TypeScript Interfaces (`slide-interfaces.ts`)

Comprehensive interface definitions for all slide data structures:

```typescript
import type { GardeData, SyntheseData, ZoomData, DetailProvisionData } from '@/lib/data/slide-interfaces'

// Base interface for all slides
interface SlideData {
  portfolioId: string
  extractDate: string
  isLoading: boolean
  error: string | null
  lastUpdated: Date
}

// Slide-specific interfaces extend SlideData
interface GardeData extends SlideData {
  clientName: string
  businessPortfolioId: string
  extractDateFormatted: string
  // ... additional properties
}
```

**Key Features:**
- Recharts-compatible chart data interfaces
- Comprehensive type safety for all data transformations
- Loading and error state management
- Flexible configuration interfaces

### 3. French Localization (`french-localization.ts`)

Utilities for French locale formatting:

```typescript
import { 
  formatDateToFrenchMonth, 
  formatCurrencyFrench, 
  formatPercentageFrench,
  textTransformers 
} from '@/lib/data/french-localization'

// Format dates
formatDateToFrenchMonth('2025-02-15') // "Février 2025"

// Format currency
formatCurrencyFrench(1234567.89) // "1 234 567,89 €"

// Format percentages
formatPercentageFrench(12.34) // "12,3 %"

// Transform text
textTransformers.strategyToDisplay('cash') // "Liquidités"
```

**Key Features:**
- French month name mapping
- Currency and number formatting with proper separators
- Percentage formatting
- Text transformation helpers for strategies and buckets
- ISIN code validation and formatting

### 4. Error Handling Framework (`error-handling.ts`)

Comprehensive error handling system:

```typescript
import { 
  DatabaseError, 
  PortfolioNotFoundError, 
  globalErrorHandler,
  errorUtils 
} from '@/lib/data/error-handling'

// Handle errors with recovery
try {
  const data = await fetchData()
} catch (error) {
  const errorDetails = globalErrorHandler.handleError(error)
  
  if (error instanceof DatabaseError && error.retryable) {
    const recovery = await globalErrorHandler.attemptRecovery(
      error, 
      () => fetchData(),
      3 // max retries
    )
  }
}
```

**Key Features:**
- Structured error types with severity levels
- Automatic retry mechanisms with exponential backoff
- French user-friendly error messages
- Error logging and statistics
- Recovery suggestions for common issues

## Usage Examples

### Basic Portfolio Data Retrieval

```typescript
import { portfolioService } from '@/lib/data/portfolio-service'
import { formatCurrencyFrench } from '@/lib/data/french-localization'

async function getPortfolioSummary(portfolioId: string) {
  try {
    // Get basic data
    const portfolio = await portfolioService.getPortfolioMetadata(portfolioId)
    const totalValuation = await portfolioService.getTotalValuation(portfolioId)
    
    // Get strategy breakdown
    const strategies = await portfolioService.getPortfolioByStrategy(portfolioId)
    
    return {
      clientName: portfolio?.name || 'Client inconnu',
      totalValuation: formatCurrencyFrench(totalValuation),
      strategies: strategies.map(s => ({
        name: s.strategy,
        value: formatCurrencyFrench(s.total_valuation),
        percentage: formatPercentageFrench(s.weight_percentage)
      }))
    }
  } catch (error) {
    globalErrorHandler.handleError(error, { 
      component: 'portfolio-summary',
      portfolioId 
    })
    throw error
  }
}
```

### Chart Data Transformation

```typescript
import type { ChartDataPoint } from '@/lib/data/slide-interfaces'

async function getStrategyChartData(portfolioId: string): Promise<ChartDataPoint[]> {
  const strategies = await portfolioService.getPortfolioByStrategy(portfolioId)
  
  return strategies.map(strategy => ({
    name: textTransformers.strategyToDisplay(strategy.strategy),
    value: strategy.total_valuation,
    percentage: strategy.weight_percentage,
    formatted: formatCurrencyFrench(strategy.total_valuation),
    color: getStrategyColor(strategy.strategy)
  }))
}
```

### Error Handling with Recovery

```typescript
import { errorUtils } from '@/lib/data/error-handling'

const safeGetPortfolioData = errorUtils.safeAsync(
  () => portfolioService.getLatestPortfolioData(portfolioId),
  [], // fallback value
  { component: 'portfolio-data-fetch', portfolioId }
)

const data = await safeGetPortfolioData()
```

## Database Schema Integration

The service layer integrates with the existing database schema defined in `src/lib/db/schema.ts`:

```typescript
// Portfolio table
export const portfolio = pgTable('portfolio', {
  id: uuid('id').primaryKey(),
  business_portfolio_id: text('business_portfolio_id').unique().notNull(),
  name: text('name'),
  client_email: text('client_email').unique().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
})

// Portfolio data table (11 business columns A-K from Excel)
export const portfolioData = pgTable('portfolio_data', {
  id: uuid('id').primaryKey(),
  portfolio_id: uuid('portfolio_id').references(() => portfolio.id),
  extract_date: date('extract_date').notNull(),
  // ... 11 business columns
})
```

## Performance Considerations

### Caching Strategy

The system implements multiple levels of caching:

1. **React Cache**: Uses React's built-in `cache()` function for request deduplication
2. **Database Query Optimization**: Efficient queries with proper indexing
3. **Aggregation Caching**: Cached results for expensive calculations

### Query Optimization

- Uses Drizzle ORM for type-safe database operations
- Implements efficient JOIN operations for related data
- Proper indexing on frequently queried columns (`portfolio_id`, `extract_date`)
- Batch processing for multiple portfolio operations

## Error Handling Strategy

### Error Classification

1. **Critical Errors**: Database failures, missing portfolios
2. **Warning Errors**: Data validation issues, chart preparation failures  
3. **Info Errors**: Cache misses, performance calculations unavailable

### Recovery Mechanisms

- Automatic retry with exponential backoff for transient failures
- Fallback values for non-critical data
- User-friendly error messages in French
- Comprehensive error logging and monitoring

## Integration with Slide Components

Each slide type has specific data transformation requirements:

### Slide 1 (Garde/Cover)
- Portfolio metadata
- French date formatting
- Client information

### Slide 2 (Synthèse/Summary)  
- Total valuations
- Bucket and strategy aggregations
- Chart data preparation

### Slide 3 (Zoom/Analysis)
- Detailed strategy breakdowns
- Performance metrics
- Filtering capabilities

### Slide 4 (Detail Provision)
- Fund-level details
- Tabular data formatting
- Provision-specific calculations

## Development Guidelines

### Adding New Data Transformations

1. Define TypeScript interfaces in `slide-interfaces.ts`
2. Implement database queries in `portfolio-service.ts`
3. Add error handling with appropriate error types
4. Include French localization for user-facing strings
5. Add comprehensive JSDoc documentation

### Error Handling Best Practices

1. Use specific error types for different failure modes
2. Implement retry logic for transient failures
3. Provide fallback values for non-critical data
4. Log errors with sufficient context for debugging

### Testing Considerations

- Mock database responses for unit tests
- Test error scenarios and recovery mechanisms
- Validate French formatting functions
- Test caching behavior and invalidation

## Next Steps

This foundational architecture enables the implementation of subsequent tasks:

- **Task 2**: Slide 1 (Garde/Cover) Data Provider
- **Task 3**: Slide 2 (Synthèse) Data Provider & Chart Transformation  
- **Task 4**: Slide 3 (Zoom) Data Provider & Strategy Analysis
- **Task 5**: Slide 4 (Detail Provision) Data Provider & Tabular Data

Each subsequent task will build upon this foundation to implement slide-specific data transformations and chart preparation logic. 