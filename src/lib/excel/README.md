# Excel Module

This module handles all Excel file processing for the portfolio data ingestion system. It provides comprehensive validation, parsing, and file management capabilities for `.xlsx` files containing financial portfolio data.

## 📁 Module Structure

```
src/lib/excel/
├── README.md                 # This file - module documentation
├── constants/               # Constants and configuration
│   ├── columns.ts          # Excel column mappings and headers
│   └── validation-rules.ts # Validation rules and error messages
├── types/                  # TypeScript type definitions
│   └── excel-format.ts    # Excel-related type definitions
├── validation/             # Excel validation logic
│   ├── excel-cells.ts     # B1 (Portfolio ID) & B5 (Date) validation
│   ├── excel-headers.ts   # Column header validation (French)
│   ├── excel-format.ts    # Main validation orchestrator
│   └── portfolio-schema.ts # Zod schemas for portfolio data
└── file-management/        # File organization utilities
    └── scanner.ts          # Directory scanning and file discovery
```

## 🎯 Core Functionality

### 1. Excel Format Validation
- **Structure**: 11 columns (A-K), headers at row 9, data from row 10
- **Special Cells**: Portfolio ID at B1, extraction date at B5
- **Headers**: Exact French column names validation
- **Data Types**: Numeric precision, text length, currency codes, ISIN validation

### 2. File Management
- **Single Directory**: All files in `data/excel/`
- **Manual Organization**: User manages files directly
- **Detailed Validation**: Comprehensive error reporting with cell references
- **File Discovery**: Automatic scanning for Excel files

### 3. Data Types & Validation
- **Business Columns**: 11 specific financial data columns
- **Type Safety**: Complete TypeScript coverage
- **Schema Validation**: Zod-based validation rules
- **Error Reporting**: Specific cell reference error messages

## 📋 Excel File Requirements

### File Format
- **Extension**: `.xlsx` files only
- **Structure**: Exactly 11 columns (A-K)
- **Size Limit**: 50MB maximum

### Required Cells
| Cell | Content | Validation |
|------|---------|------------|
| **B1** | Portfolio ID | Alphanumeric, 1-100 chars |
| **B5** | Extraction Date | Valid date, 2000-2050 |

### Column Headers (Row 9)
| Column | French Header | DB Field | Type | Description |
|--------|---------------|----------|------|-------------|
| A | Solde | `balance` | numeric(18,2) | Account balance |
| B | Libellé | `label` | text | Asset label |
| C | Devise | `currency` | char(3) | Currency code |
| D | Estimation + int. courus (EUR) | `valuation_eur` | numeric(18,2) | EUR valuation |
| E | Poids (%) | `weight_pct` | numeric(6,3) | Portfolio weight |
| F | Code ISIN | `isin` | char(12) | ISIN identifier |
| G | B / P - Total (EUR) | `book_price_eur` | numeric(18,2) | Book price EUR |
| H | Frais (EUR) | `fees_eur` | numeric(18,2) | Fees in EUR |
| I | Nom | `asset_name` | text | Asset name |
| J | Stratégie | `strategy` | text | Investment strategy |
| K | Poche | `bucket` | text | Asset bucket |

## 📂 Directory Structure

The module works with a simplified directory structure:

```
data/excel/                 # All Excel files go here
├── portfolio_client1.xlsx  # Example Excel file
├── portfolio_client2.xlsx  # Another Excel file
└── README.md              # Usage instructions
```

## 🚀 Usage

### Processing Files

```bash
# Process all Excel files in data/excel/
pnpm run ingest

# Process a specific file
pnpm run ingest --file portfolio_2024.xlsx

# Validate files without processing
pnpm run validate-excel
```

### Programmatic Usage

```typescript
import { scanExcelFiles } from '@/lib/excel/file-management/scanner'
import { validateExcelStructure } from '@/lib/excel/validation/excel-format'

// Scan for all Excel files
const { files, errors } = await scanExcelFiles()

// Validate a specific file
const validation = await validateExcelStructure('data/excel/portfolio.xlsx')
```

## 📋 Validation Process

### File Discovery
1. Scan `data/excel/` directory for `.xlsx` files
2. Extract file metadata (size, modification date)
3. Perform basic file validation (size limits, corruption check)

### Structure Validation  
1. **Special Cells**: Validate Portfolio ID (B1) and Extract Date (B5)
2. **Headers**: Verify exact French column names at row 9
3. **Data**: Validate data types and formats from row 10 onward
4. **Schema**: Ensure compliance with 11-column structure

### Error Reporting
- **Cell-specific**: Exact cell references for validation failures
- **Detailed Messages**: Clear descriptions of validation issues
- **Console Output**: Real-time feedback during processing
- **Actionable**: Instructions for fixing validation errors

## 🎮 Constants & Configuration

### Column Mappings
```typescript
import { EXPECTED_HEADERS, COLUMN_TO_FIELD_MAP } from '@/lib/excel/constants/columns'

// French headers that must match exactly
EXPECTED_HEADERS.A // "Solde"
EXPECTED_HEADERS.B // "Libellé"

// Database field mappings
COLUMN_TO_FIELD_MAP.A // "balance"
COLUMN_TO_FIELD_MAP.B // "label"
```

### Validation Rules
```typescript
import { NUMERIC_RULES, VALID_CURRENCIES } from '@/lib/excel/constants/validation-rules'

// Numeric precision rules
NUMERIC_RULES.BALANCE // { precision: 18, scale: 2 }

// Allowed currencies
VALID_CURRENCIES // ['EUR', 'USD', 'GBP', ...]
```

## 🚨 Error Handling

### Error Types
- **STRUCTURE**: File structure issues (column count, row count)
- **HEADER**: Column header mismatches
- **CELL**: Special cell validation (B1, B5)
- **DATA**: Data content validation
- **FORMAT**: File format issues

### Error Messages
All errors include:
- **Type**: Error category
- **Message**: Human-readable description
- **Cell Reference**: Specific cell location (e.g., "B1", "A9")
- **Severity**: ERROR or WARNING

### Error Logs
Failed files generate `.error.txt` files with:
- Detailed error list with cell references
- Instructions for fixing issues
- Timestamp and file information

## 🔄 Integration Points

### Database Integration
- Maps to `portfolio_data` table schema (Task 1)
- Uses column mappings for field insertion
- Supports extract date and portfolio ID linking

### Ingestion Pipeline
- Provides validation for Task 3 (Excel Parser)
- Feeds into Task 4 (Ingestion Command)
- Supports Task 6 (Error Handling & Logging)

### File System Integration
- Works with simplified `data/excel/` directory structure
- Supports manual file management workflow
- Integrates with `.gitignore` for security

## 🧪 Testing

### Test Coverage
- Unit tests for each validation component
- Integration tests for file processing flows
- Edge case testing for malformed files
- Performance testing for large files

### Test Files
- Valid Excel samples
- Invalid Excel samples with specific errors
- Edge cases (empty files, large files, etc.)

## 🔒 Security

### Data Protection
- Excel files excluded from git
- Sensitive financial data handling
- Audit trail for all operations

### Validation Security
- Input sanitization
- File size limits
- Extension validation
- Path traversal prevention

---

This module provides the complete foundation for Excel file processing in the portfolio data ingestion system, with comprehensive validation, error handling, and file management capabilities. 