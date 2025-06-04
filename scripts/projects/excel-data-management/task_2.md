# Task 2: Excel File Structure & Validation

## Overview
Create the data/excel/ folder structure and implement strict 11-column format validation system. This task establishes the file organization and validation framework that will be used by the Excel parser to ensure data integrity before database ingestion.

## Status
- **Current Status**: completed
- **Priority**: High
- **Assigned**: AI Assistant
- **Estimated Hours**: 4-6 hours
- **Dependencies**: Task 1 (Database Schema & Setup)
- **Cross-Project Dependencies**: None

## Detailed Requirements

### Directory Structure Setup
- [x] Create `data/excel/` directory in project root
- [x] Create subdirectories for organization:
  - [x] `data/excel/incoming/` - New Excel files to be processed
  - [x] `data/excel/processed/` - Successfully ingested files
  - [x] `data/excel/error/` - Files that failed validation
- [x] Create `.gitkeep` files to ensure directories are tracked
- [x] Add appropriate `.gitignore` rules for Excel files (keep structure, ignore content)

### Excel Format Validation
- [x] Implement strict 11-column format validator (A-K)
- [x] Validate headers at row 9 match expected French column names
- [x] Validate Portfolio ID presence and format in cell B1
- [x] Validate extraction date presence and format in cell B5
- [x] Implement row-by-row data validation starting from row 10
- [x] Validate data types match expected schema (numeric, text, dates)
- [x] Implement comprehensive error reporting with specific cell references

### File Management System
- [x] Implement file discovery and scanning in `incoming/` directory
- [x] Create file movement utilities (incoming → processed/error)
- [x] Implement file backup and archival system
- [x] Add file timestamp and metadata tracking
- [x] Implement duplicate file detection and handling

### Validation Schema Implementation
- [x] Create Zod schemas for Excel structure validation
- [x] Implement column header validation against expected French names
- [x] Create cell-level validation rules for each column type
- [x] Implement Portfolio ID format validation (UUID/string patterns)
- [x] Create date validation for extraction date (B5)
- [x] Implement ISIN code format validation (column F)
- [x] Add currency code validation (column C - 3 characters)

## Technical Implementation

### Excel Column Specification (From README.md)
```typescript
// Expected headers at row 9 (A9-K9)
const EXPECTED_HEADERS = {
  A: 'Solde',                          // balance: numeric(18,2)
  B: 'Libellé',                        // label: text
  C: 'Devise',                         // currency: char(3)
  D: 'Estimation + int. courus (EUR)', // valuation_eur: numeric(18,2)
  E: 'Poids (%)',                      // weight_pct: numeric(6,3)
  F: 'Code ISIN',                      // isin: char(12)
  G: 'B / P - Total (EUR)',            // book_price_eur: numeric(18,2)
  H: 'Frais (EUR)',                    // fees_eur: numeric(18,2)
  I: 'Nom',                            // asset_name: text
  J: 'Stratégie',                      // strategy: text
  K: 'Poche'                           // bucket: text
} as const;
```

### Validation Rules
```typescript
// Portfolio ID: Cell B1 - Required UUID or string identifier
// Extract Date: Cell B5 - Required date format
// Headers: Row 9 - Must match EXPECTED_HEADERS exactly
// Data: Row 10+ - Must conform to column types
// Column Count: Exactly 11 columns (A-K)
```

### Directory Structure
```
data/
└── excel/
    ├── incoming/          # New files await processing
    │   └── .gitkeep
    ├── processed/         # Successfully ingested files
    │   └── .gitkeep
    ├── error/            # Files that failed validation
    │   └── .gitkeep
    └── README.md         # Usage instructions
```

### Cross-Project Considerations
- Validation system must align with Task 3 (Excel Parser) requirements
- Error reporting should integrate with Task 6 (Error Handling & Logging)
- File structure supports future automated processing (Task 8)

## Files to Create/Modify

### Directory Structure
- `data/excel/` - Main Excel files directory
- `data/excel/incoming/` - New files directory
- `data/excel/processed/` - Successfully processed files
- `data/excel/error/` - Failed validation files
- `data/excel/.gitkeep` - Ensure directory tracking
- `data/excel/README.md` - Usage instructions for Excel file placement

### Validation Framework
- `src/lib/validation/excel-format.ts` - Excel structure validation schemas
- `src/lib/validation/excel-headers.ts` - Column header validation
- `src/lib/validation/excel-cells.ts` - Cell-level validation (B1, B5)
- `src/lib/validation/portfolio-data.ts` - Row data validation rules

### File Management
- `src/lib/file-management/scanner.ts` - Directory scanning utilities
- `src/lib/file-management/mover.ts` - File movement between directories
- `src/lib/file-management/validator.ts` - File format pre-validation
- `src/lib/file-management/metadata.ts` - File metadata extraction

### Types & Constants
- `src/lib/types/excel-format.ts` - TypeScript types for Excel structure
- `src/lib/constants/excel-columns.ts` - Column mappings and headers
- `src/lib/constants/validation-rules.ts` - Validation constants and rules

### Configuration
- `.gitignore` - Add Excel file exclusions with structure preservation
- `data/excel/README.md` - Documentation for Excel file placement

## Testing Requirements
- [ ] Test directory creation and structure
- [ ] Test Excel header validation with correct French headers
- [ ] Test Portfolio ID validation in cell B1
- [ ] Test extraction date validation in cell B5
- [ ] Test column count validation (exactly 11 columns)
- [ ] Test data type validation for each column
- [ ] Test file movement between directories
- [ ] Test error reporting with specific cell references
- [ ] Test duplicate file detection
- [ ] Test malformed Excel file handling

## Definition of Done
- [x] Complete directory structure created under `data/excel/`
- [x] Comprehensive Excel format validation implemented
- [x] Zod schemas for all validation rules created
- [x] File management system working (scan, move, track)
- [x] Error reporting system provides specific validation failures
- [x] Portfolio ID and extraction date validation working
- [x] Column header validation in French implemented
- [x] All 11 columns validated according to README.md specification
- [x] File organization system ready for ingestion process
- [x] Documentation complete for Excel file requirements

## Notes
- Headers must match exactly the French names specified in README.md
- Portfolio ID extraction from B1 (not B2 as mentioned elsewhere)
- Extract Date from B5 must be valid date format
- Validation should be strict to prevent data corruption
- Error messages should be specific enough for users to fix Excel files
- File movement preserves original files for audit trail

## Blockers
None - dependencies met with Task 1 completion

## Related Tasks
### Within This Project
- Task 1: Database Schema & Setup (completed - provides validation schema reference)
- Task 3: Excel Parser Implementation (will use this validation framework)
- Task 4: Ingestion Command & API (will use file management system)
- Task 6: Error Handling & Logging (will extend validation error reporting)

### Cross-Project Tasks
None - this is an internal Excel processing foundation

---
**Project**: Excel Data Management System
**Created**: 2024
**Last Updated**: [Auto-updated by AI] 