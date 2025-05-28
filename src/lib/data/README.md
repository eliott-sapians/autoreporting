# Data Management

This directory contains temporary data files and services that will eventually be replaced by API calls.

## Structure

- `provision-data.json` - Temporary JSON file containing provision data
- `provision-service.ts` - Service layer for data access with async functions

## Usage

```typescript
import { getProvisionData, getTotalData, getFundsData } from '@/lib/data/provision-service'

// Get all provision data
const data = await getProvisionData()

// Get only total data
const total = await getTotalData()

// Get only funds data
const funds = await getFundsData()
```

## Migration to API

When the backend API is ready, replace the content of `provision-service.ts` with actual API calls:

```typescript
export async function getProvisionData(): Promise<ProvisionData> {
	const response = await fetch('/api/provision')
	if (!response.ok) {
		throw new Error('Failed to fetch provision data')
	}
	return response.json()
}
```

## Types

All interfaces are defined in `@/lib/types.ts`:
- `FundData` - Individual fund information
- `TotalData` - Summary totals
- `ProvisionData` - Complete provision data structure 