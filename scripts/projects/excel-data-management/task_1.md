# Task 1: Database Schema & Setup

## Overview
Set up the database foundation for the Excel data management system using Drizzle ORM with PostgreSQL (Supabase). Design a robust schema that supports portfolio data storage, audit trails, and multi-tenant architecture.

## Status
- **Current Status**: pending
- **Priority**: High
- **Assigned**: AI Assistant
- **Estimated Hours**: 4-6 hours
- **Dependencies**: None
- **Cross-Project Dependencies**: None

## Detailed Requirements

### Database Setup
- [ ] Install Drizzle ORM and related dependencies
- [ ] Install PostgreSQL driver and Supabase client
- [ ] Configure Supabase connection and environment variables
- [ ] Set up Drizzle configuration file
- [ ] Create database migration system

### Schema Design
- [ ] Design `portfolios` table for portfolio metadata
- [ ] Design `portfolio_data` table for the 11-column Excel data
- [ ] Design `data_updates` table for audit trail
- [ ] Define proper relationships and foreign keys
- [ ] Implement proper indexing for performance

### Data Types & Validation
- [ ] Define TypeScript types for all entities
- [ ] Implement Zod schemas for validation
- [ ] Handle proper data type conversion from Excel
- [ ] Support for monetary values and percentages
- [ ] Date handling with timezone considerations

## Technical Implementation

### Dependencies to Install
```bash
npm install drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit @types/pg
```

### Database Schema Structure

```typescript
// portfolios table
{
  id: string (uuid, primary key)
  portfolio_id: string (from Excel B2, unique)
  name: string (optional display name)
  created_at: timestamp
  updated_at: timestamp
}

// portfolio_data table
{
  id: string (uuid, primary key)
  portfolio_id: string (foreign key to portfolios.portfolio_id)
  data_date: date (from Excel B5)
  col_1: string (Excel column 1)
  col_2: string (Excel column 2)
  col_3: string (Excel column 3)
  col_4: string (Excel column 4)
  col_5: string (Excel column 5)
  col_6: string (Excel column 6)
  col_7: string (Excel column 7)
  col_8: string (Excel column 8)
  col_9: string (Excel column 9)
  col_10: string (Excel column 10)
  col_11: string (Excel column 11)
  row_number: integer (original row from Excel)
  created_at: timestamp
}

// data_updates table (audit trail)
{
  id: string (uuid, primary key)
  portfolio_id: string (foreign key)
  update_type: string ('replace', 'delete', 'error')
  rows_affected: integer
  file_name: string
  updated_by: string (admin user)
  update_date: timestamp
  error_message: string (nullable)
}
```

### Cross-Project Considerations
- Schema must be flexible for future UI display requirements
- Consider existing `provision-data.json` structure for potential migration
- Ensure proper permissions for admin-only access

## Files to Create/Modify

### Database Configuration
- `src/lib/db/schema.ts` - Drizzle schema definitions
- `src/lib/db/connection.ts` - Supabase connection setup
- `src/lib/db/types.ts` - TypeScript type definitions
- `drizzle.config.ts` - Drizzle configuration file
- `.env.local` - Environment variables (add to .env.example)

### Migration Files
- `src/lib/db/migrations/` - Directory for migration files
- `src/lib/db/migrations/0001_initial_schema.sql` - Initial schema migration

### Validation
- `src/lib/validation/portfolio-schema.ts` - Zod schemas for data validation

## Testing Requirements
- [ ] Test Supabase connection establishment
- [ ] Test schema creation and migrations
- [ ] Test data insertion and retrieval
- [ ] Test foreign key constraints
- [ ] Test data validation with Zod schemas
- [ ] Test transaction rollback capabilities

## Definition of Done
- [ ] Drizzle ORM properly configured with Supabase
- [ ] All database tables created with proper schema
- [ ] Migration system working and tested
- [ ] TypeScript types defined and exported
- [ ] Zod validation schemas implemented
- [ ] Database connection tested and verified
- [ ] No breaking changes to existing functionality
- [ ] Environment variables documented

## Notes
- Use UUIDs for all primary keys for better scalability
- Consider using JSONB for flexible column storage if needed later
- Implement proper indexing on portfolio_id and data_date for performance
- Set up proper foreign key cascading for data deletion

## Blockers
None - this is the foundation task

## Related Tasks
### Within This Project
- Task 2: Excel File Structure & Validation (depends on this schema)
- Task 3: Excel Parser Implementation (will use these types)
- Task 4: Data Replacement API (will use these operations)

### Cross-Project Tasks
- None currently

---
**Project**: Excel Data Management System
**Created**: 2024
**Last Updated**: [Auto-updated by AI] 