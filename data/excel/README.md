# Excel Files Directory

This directory contains Excel files for the portfolio data ingestion system.

## Simple Workflow

1. **Place Files**: Drop your `.xlsx` files directly in this `data/excel/` directory
2. **Process**: Run `pnpm run ingest` or `pnpm run ingest --file filename.xlsx` 
3. **Results**: Check console output for validation results and processing status
4. **Manage**: Files stay in place - remove or organize them manually as needed

## Excel File Requirements

### Format Specification
- **File Format**: `.xlsx` files only
- **Columns**: Exactly 11 columns (A-K)
- **Headers**: Row 9 must contain exact French column names
- **Data**: Starting from row 10
- **Number Format**: French decimal separator (comma `,`) for numeric values

### Required Cells
- **B1**: Portfolio ID (UUID or string identifier)
- **B5**: Extraction Date (valid date format)

### French Number Formatting
**Important**: All numeric values in the Excel file must use **French decimal separators**:
- ✅ Correct: `123,45` (comma as decimal separator)
- ❌ Incorrect: `123.45` (dot as decimal separator)

Examples of valid French numbers:
- `1 234,56` (with space as thousands separator)
- `234,56` (simple decimal)
- `123` (whole number)
- `-45,67` (negative number)

### Column Headers (Row 9)
| Column | Header (French)                  | Data Type     | Description | Example Value |
|--------|----------------------------------|---------------|-------------|---------------|
| A      | Solde                           | numeric(18,2) | Balance     | `1 234,56`    |
| B      | Libellé                         | text          | Label       | `Actions XYZ` |
| C      | Devise                          | char(3)       | Currency    | `EUR`         |
| D      | Estimation + int. courus (EUR)  | numeric(18,2) | Valuation   | `2 345,67`    |
| E      | Poids (%)                       | numeric(6,3)  | Weight %    | `12,345`      |
| F      | Code ISIN                       | char(12)      | ISIN Code   | `FR0000120073`|
| G      | B / P - Total (EUR)             | numeric(18,2) | Book Price  | `3 456,78`    |
| H      | Frais (EUR)                     | numeric(18,2) | Fees        | `12,34`       |
| I      | Nom                             | text          | Asset Name  | `Total SA`    |
| J      | Stratégie                       | text          | Strategy    | `Actions`     |
| K      | Poche                           | text          | Bucket      | `Core`        |

## Usage Commands

```bash
# Process all Excel files in this directory
pnpm run ingest

# Process a specific file
pnpm run ingest --file portfolio_2024.xlsx

# Check for validation errors without processing
pnpm run validate-excel
```

## Validation Rules

- Headers must match exactly (case-sensitive French names)
- Portfolio ID in B1 must be present and valid
- Extraction date in B5 must be valid date format
- **All numeric fields must use French decimal separators (comma `,`)**
- Currency codes must be 3 characters
- ISIN codes must follow proper format

## Error Handling

If validation fails, you'll see detailed error messages in the console including:
- Specific cell references for validation failures
- Missing or incorrect headers
- Data type mismatches (including incorrect decimal separators)
- File format issues

**Common French Number Format Errors:**
- Using dot (`.`) instead of comma (`,`) as decimal separator
- Invalid characters in numeric fields
- Missing decimal separator when expected

Fix the issues in your Excel file and run the command again.

## Security Notes

- This directory may contain sensitive financial data
- Excel files are excluded from git by default
- Only directory structure is tracked in version control 