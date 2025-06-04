# Task 3: Excel Parser Implementation (exceljs)

## Overview
Implement a robust Excel parser using exceljs library that extracts Portfolio ID from cell B1, extraction date from cell B5, and processes row-by-row data for the 11 business columns (A-K). This task focuses purely on reading and parsing Excel files into typed TypeScript objects, leveraging the validation framework built in Task 2.

## Status
- **Current Status**: pending
- **Priority**: High
- **Assigned**: AI Assistant
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Task 1 (Database Schema & Setup), Task 2 (Excel File Structure & Validation)
- **Cross-Project Dependencies**: None

## Detailed Requirements

### Core Excel Parsing
- [ ] Implement main Excel parser using exceljs library
- [ ] Extract Portfolio ID from cell B1 with validation
- [ ] Extract extraction date from cell B5 with date parsing
- [ ] Process data rows starting from row 10 through end of data
- [ ] Map Excel columns A-K to TypeScript objects using existing column constants
- [ ] Handle ExcelJS cell types (number, string, date, formula results)

### Data Transformation
- [ ] Convert Excel numeric values to proper TypeScript numbers
- [ ] Normalize text values (trim whitespace, handle encoding)
- [ ] Parse and validate date formats from Excel
- [ ] Handle currency formatting and numeric precision
- [ ] Convert Excel formulas to their calculated values
- [ ] Process ISIN codes with format validation

### Integration with Existing Framework
- [ ] Use existing validation framework from Task 2 as prerequisite check
- [ ] Integrate with existing column constants and type definitions
- [ ] Leverage existing error types and validation context
- [ ] Return data in format compatible with database schema from Task 1
- [ ] Maintain consistency with existing file management system

### Parser Output Structure
- [ ] Return structured parsing results with success/failure status
- [ ] Provide parsed data as array of typed objects matching database schema
- [ ] Include parsing statistics (rows processed, skipped, etc.)
- [ ] Return row-level parsing errors without stopping process
- [ ] Maintain original row numbers for error reporting

## Technical Implementation

### Parser Architecture
```typescript
// Main parser function signature
export async function parseExcelFile(filePath: string): Promise<ParseResult>

// Core types for parser output
interface ParseResult {
  success: boolean
  portfolioId: string | null
  extractDate: Date | null
  records: ParsedRowData[]
  errors: ParseError[]
  stats: ParseStats
}

interface ParsedRowData {
  rowNumber: number
  balance: number | null
  label: string | null
  currency: string | null
  valuation_eur: number | null
  weight_pct: number | null
  isin: string | null
  book_price_eur: number | null
  fees_eur: number | null
  asset_name: string | null
  strategy: string | null
  bucket: string | null
}
```

### Cell Value Extraction Strategy
- Use exceljs worksheet.getCell() for safe cell access
- Handle different ExcelJS cell value types (number, string, date, richText, formula)
- Convert formula cells to their calculated results
- Apply null/undefined handling with graceful degradation
- Preserve original row numbers for error tracing

### Data Type Conversion
- Numeric cells → TypeScript numbers with precision handling
- Text cells → Trimmed strings with encoding normalization
- Date cells → JavaScript Date objects with validation
- Formula cells → Extract calculated values, not formulas
- Empty cells → null values (not undefined)

### Cross-Project Considerations
- Parser output format must align with Task 4 ingestion requirements
- Error reporting must be compatible with Task 6 error handling system
- File processing should work with Task 2 file management system

## Files to Create/Modify

### Core Parser Files
- `src/lib/excel/parser/excel-parser.ts` - Main parsing orchestrator
- `src/lib/excel/parser/cell-extractor.ts` - Safe cell value extraction utilities
- `src/lib/excel/parser/data-transformer.ts` - Type conversion and normalization
- `src/lib/excel/parser/row-processor.ts` - Individual row processing logic

### Type Definitions
- `src/lib/excel/types/parser.ts` - Parser-specific TypeScript interfaces
- `src/lib/excel/types/parse-result.ts` - Parser output type definitions

### Integration Files
- `src/lib/excel/index.ts` - Main export aggregator for Excel functionality
- `src/lib/excel/parser/index.ts` - Parser module exports

## Testing Requirements
- [ ] Unit tests for cell value extraction with various ExcelJS cell types
- [ ] Unit tests for data transformation functions
- [ ] Unit tests for row processing logic
- [ ] Integration tests with sample Excel files from data/excel/
- [ ] Edge case testing (empty cells, formula cells, malformed data)
- [ ] Parser output format validation tests

## Definition of Done
- [ ] Excel parser successfully extracts Portfolio ID from B1
- [ ] Excel parser successfully extracts extraction date from B5
- [ ] Row-by-row parsing works for all 11 columns (A-K)
- [ ] Parser handles all ExcelJS cell types correctly
- [ ] Data transformation produces properly typed objects
- [ ] Parser integrates with existing validation framework
- [ ] Parser output format matches database schema requirements
- [ ] Error handling preserves row numbers for debugging
- [ ] Code follows project TypeScript and formatting standards
- [ ] Unit tests cover all parser functions

## Notes
- Focus ONLY on parsing - no database operations (that's Task 4)
- Use existing validation from Task 2 as prerequisite, don't duplicate
- Parser should be pure function that transforms Excel → TypeScript objects
- Preserve all parsing errors for later processing by Task 6
- Ensure output format works seamlessly with Task 4 ingestion process

## Blockers
None - dependencies (Task 1 & 2) are completed

## Related Tasks
### Within This Project
- Task 1: Database Schema & Setup (completed - provides target data structure)
- Task 2: Excel File Structure & Validation (completed - provides validation framework)
- Task 4: Ingestion Command & API (will consume parser output for database operations)
- Task 6: Error Handling & Logging (will extend parser error reporting)

### Cross-Project Tasks
None - this is pure Excel parsing functionality

---
**Project**: Excel Data Management System
**Created**: 2024
**Last Updated**: [Auto-updated by AI] 