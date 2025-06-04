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

### Required Cells
- **B1**: Portfolio ID (UUID or string identifier)
- **B5**: Extraction Date (valid date format)

### Column Headers (Row 9)
| Column | Header (French)                  | Data Type     | Description |
|--------|----------------------------------|---------------|-------------|
| A      | Solde                           | numeric(18,2) | Balance     |
| B      | Libellé                         | text          | Label       |
| C      | Devise                          | char(3)       | Currency    |
| D      | Estimation + int. courus (EUR)  | numeric(18,2) | Valuation   |
| E      | Poids (%)                       | numeric(6,3)  | Weight %    |
| F      | Code ISIN                       | char(12)      | ISIN Code   |
| G      | B / P - Total (EUR)             | numeric(18,2) | Book Price  |
| H      | Frais (EUR)                     | numeric(18,2) | Fees        |
| I      | Nom                             | text          | Asset Name  |
| J      | Stratégie                       | text          | Strategy    |
| K      | Poche                           | text          | Bucket      |

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
- All numeric fields must be valid numbers
- Currency codes must be 3 characters
- ISIN codes must follow proper format

## Error Handling

If validation fails, you'll see detailed error messages in the console including:
- Specific cell references for validation failures
- Missing or incorrect headers
- Data type mismatches
- File format issues

Fix the issues in your Excel file and run the command again.

## Security Notes

- This directory may contain sensitive financial data
- Excel files are excluded from git by default
- Only directory structure is tracked in version control 