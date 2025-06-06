# Data Layer Documentation

This folder contains the data layer infrastructure for the portfolio reporting system.

## Folder Structure

### `/hooks`
- `use-portfolio-data.ts` - Main React hook providing portfolio data with slide-specific transformations for 6 presentation slides

### `/transformers`
- `index.ts` - Main export file for all transformers
- `constants.ts` - Bucket mappings (CT/LTL/LTI), color schemes, and helper functions  
- `utils.ts` - Formatting utilities (currency, percentage) and performance calculations
- `basic-transformers.ts` - Legacy/basic transformers (TotalData, FundData, ProvisionData)
- `allocation-transformers.ts` - Strategy and bucket filtering, allocation chart data
- `slide-transformers.ts` - Main slide transformers (Garde, Synthese, Zoom)
- `bucket-transformers.ts` - Bucket detail transformers (CT/LTL/LTI) and legacy support

### Root Files
- `index.ts` - Main data layer exports (hooks, transformers, interfaces)
- `slide-interfaces.ts` - TypeScript interfaces for all 6 slide data structures
- `french-localization.ts` - French date formatting and localization utilities

## Key Concepts

**Slides**: 6 distinct presentation slides with specific data requirements
- Slide 1: Garde (cover page with fixed client info)
- Slide 2: Synthèse (portfolio total + allocation charts)
- Slide 3: Zoom (3-column bucket comparison)
- Slides 4-6: Detail views for CT/LTL/LTI buckets

**Buckets**: Portfolio categorization system
- CT = "Long terme provision" 
- LTL = "Long terme liquide"
- LTI = "Long terme illiquide"

**Data Flow**: API → Transformers → Hooks → Components 