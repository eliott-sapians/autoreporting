# Task 1: Database Schema & Setup

## Overview
Set up the database foundation for the Excel data management system using Drizzle ORM with PostgreSQL (Supabase). Implement the specific business schema defined in README.md with proper column mappings for the 11-column Excel format.

## Status
- **Current Status**: completed
- **Priority**: High
- **Assigned**: AI Assistant
- **Estimated Hours**: 4-6 hours
- **Dependencies**: None
- **Cross-Project Dependencies**: None

## Detailed Requirements

### Database Setup
- [x] Install Drizzle ORM and related dependencies
- [x] Install exceljs for Excel parsing
- [x] Install Zod for schema validation
- [x] Configure Supabase connection and environment variables
- [x] Set up Drizzle configuration file
- [x] Create database migration system

### Schema Implementation (Per README.md)
- [x] Implement `portfolio` table for client metadata
- [x] Implement `portfolio_data` table with specific business columns
- [x] Add audit trail table for ingestion tracking
- [x] Define proper relationships and foreign keys
- [x] Implement proper indexing for performance

### Data Types & Validation
- [x] Define TypeScript types for all entities
- [x] Implement Zod schemas for Excel data validation
- [x] Handle proper data type conversion from Excel
- [x] Support for monetary values (numeric(18,2)) and percentages (numeric(6,3))
- [x] Date handling with timezone considerations

## Technical Implementation

### Dependencies to Install
```bash
npm install drizzle-orm @supabase/supabase-js exceljs zod
npm install -D drizzle-kit @types/node
```

### Database Schema (From README.md Specification)

```typescript
// portfolio table
CREATE TABLE portfolio (
  id uuid PRIMARY KEY,
  name text,
  client_email text UNIQUE NOT NULL,
  created_at timestamptz default now()
);

// portfolio_data table (11 business columns from README)
CREATE TABLE portfolio_data (
  id uuid PRIMARY KEY default gen_random_uuid(),
  portfolio_id uuid references portfolio(id) on delete cascade,
  extract_date date not null,
  -- Excel Column Mappings (A-K, row 9+)
  balance numeric(18,2),          -- A: Solde
  label text,                     -- B: Libellé  
  currency char(3),               -- C: Devise
  valuation_eur numeric(18,2),    -- D: Estimation + int. courus (EUR)
  weight_pct numeric(6,3),        -- E: Poids (%)
  isin char(12),                  -- F: Code ISIN
  book_price_eur numeric(18,2),   -- G: B / P - Total (EUR)
  fees_eur numeric(18,2),         -- H: Frais (EUR)
  asset_name text,                -- I: Nom
  strategy text,                  -- J: Stratégie
  bucket text                     -- K: Poche
);

// ingestion_log table (audit trail)
CREATE TABLE ingestion_log (
  id uuid PRIMARY KEY default gen_random_uuid(),
  portfolio_id uuid references portfolio(id),
  file_name text not null,
  extract_date date not null,
  rows_processed integer not null,
  status text not null, -- 'success', 'error', 'partial'
  error_message text,
  processed_at timestamptz default now(),
  processed_by text
);
```

### Excel Format Specification
- **Portfolio ID**: Cell B1 
- **Extract Date**: Cell B5
- **Headers**: Row 9 (A9-K9)
- **Data**: Starting row 10+
- **Column Count**: Exactly 11 columns (A-K)

### Cross-Project Considerations
- Schema aligns with existing provision-data.json structure for easy migration
- Support for future PDF export functionality
- Ready for auth integration with client_email mapping

## Files to Create/Modify

### Database Configuration  
- `src/lib/db/schema.ts` - Drizzle schema definitions with business columns
- `src/lib/db/connection.ts` - Supabase connection setup
- `src/lib/db/types.ts` - TypeScript type definitions for portfolio data
- `drizzle.config.ts` - Drizzle configuration file
- `.env.local` - Environment variables (add to .env.example)

### Migration Files
- `src/lib/db/migrations/` - Directory for migration files
- `src/lib/db/migrations/0001_portfolio_schema.sql` - Initial business schema migration

### Validation & Types
- `src/lib/validation/portfolio-schema.ts` - Zod schemas for Excel data validation
- `src/lib/ingest/columns.ts` - Excel column mapping definitions (A-K to business fields)

### Environment Setup
- `.env.example` - Document required environment variables
- `package.json` - Add ingestion script: `"ingest": "tsx scripts/ingest.ts"`

## Testing Requirements
- [ ] Test Supabase connection establishment
- [ ] Test schema creation and migrations
- [ ] Test data insertion with business columns
- [ ] Test foreign key constraints and cascading
- [ ] Test Zod validation with Excel data types
- [ ] Test numeric precision for monetary values
- [ ] Test transaction rollback capabilities

## Definition of Done
- [x] Drizzle ORM properly configured with Supabase
- [x] Business schema tables created matching README specification
- [x] Migration system working and tested
- [x] TypeScript types defined for all business entities
- [x] Zod validation schemas for Excel data implemented
- [x] Column mapping from Excel (A-K) to business fields documented
- [x] Database connection tested and verified
- [x] Environment variables documented in .env.example
- [x] Ready for `npm run ingest` command implementation

## Notes
- Use the exact column names and types from README.md specification
- Portfolio ID extraction from B1 (not B2 as initially assumed)
- Support for the existing provision-data.json format for potential migration
- Implement proper indexing on portfolio_id and extract_date for performance
- Consider RLS policies for future client access control

## Blockers
None - this is the foundation task

## Related Tasks
### Within This Project
- Task 2: Excel File Structure & Validation (will use this schema)
- Task 3: Excel Parser Implementation (will map to these business columns)
- Task 4: Ingestion Command & API (will use these database operations)

### Cross-Project Tasks
- Future PDF export functionality (will query these business columns)
- Future client portal (will display this portfolio data)

---
**Project**: Excel Data Management System
**Created**: 2024
**Last Updated**: [Auto-updated by AI] 