/**
 * Excel Module Main Index
 * Central export point for all Excel functionality
 */

// Parser functionality (Task 3)
export * from './parser'

// Validation functionality (Task 2)
export * from './validation/excel-format'
export * from './validation/excel-headers'
export * from './validation/excel-cells'

// File management functionality (Task 2)
export * from './file-management/scanner'

// Constants and types (Task 2)
export * from './constants/columns'
export * from './constants/validation-rules'
export * from './types/excel-format'
export * from './types/parser'

// Convenience re-exports for main parser functions
export { 
	parseExcelFile, 
	canParseExcelFile, 
	extractMetadata 
} from './parser/excel-parser'

export { validateExcelStructure } from './validation/excel-format' 