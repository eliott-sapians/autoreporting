/**
 * Database Operations for Ingestion
 * Transaction-based delete-and-replace strategy
 */

import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { portfolio, portfolioData, ingestionLog } from '@/lib/db/schema'
import type { NewPortfolio, NewPortfolioData, NewIngestionLog } from '@/lib/db/schema'
import type { DatabaseOperationResult, PortfolioDataInsert } from './types'

/**
 * Create or update portfolio record
 * Ensures portfolio exists before inserting data
 */
export async function createOrUpdatePortfolio(
	businessPortfolioId: string,
	portfolioName?: string
): Promise<DatabaseOperationResult & { portfolioUuid?: string }> {
	try {
		// Check if portfolio exists by business ID
		const existingPortfolio = await db
			.select()
			.from(portfolio)
			.where(eq(portfolio.business_portfolio_id, businessPortfolioId))
			.limit(1)

		if (existingPortfolio.length === 0) {
			// Create new portfolio
			const newPortfolio: NewPortfolio = {
				business_portfolio_id: businessPortfolioId,
				name: portfolioName || `Portfolio ${businessPortfolioId}`,
				client_email: `client-${businessPortfolioId.replace(/[^a-zA-Z0-9]/g, '-')}@example.com` // Placeholder email
			}

			const result = await db.insert(portfolio).values(newPortfolio).returning({ id: portfolio.id })
			const portfolioUuid = result[0].id
			
			console.log(`[DB] Created new portfolio: ${businessPortfolioId} (UUID: ${portfolioUuid})`)
			return {
				success: true,
				rowsAffected: 1,
				errors: [],
				portfolioUuid
			}
		} else {
			// Portfolio exists, optionally update name
			const portfolioUuid = existingPortfolio[0].id
			
			if (portfolioName && existingPortfolio[0].name !== portfolioName) {
				await db
					.update(portfolio)
					.set({ name: portfolioName })
					.where(eq(portfolio.id, portfolioUuid))
				
				console.log(`[DB] Updated portfolio name for: ${businessPortfolioId}`)
			}
			
			return {
				success: true,
				rowsAffected: 0, // No new rows created
				errors: [],
				portfolioUuid
			}
		}
	} catch (error) {
		console.error(`[DB] Error creating/updating portfolio ${businessPortfolioId}:`, error)
		return {
			success: false,
			rowsAffected: 0,
			errors: [`Failed to create/update portfolio: ${error}`]
		}
	}
}

/**
 * Delete existing portfolio data for a specific portfolio and extract date
 * Part of the delete-and-replace strategy
 */
export async function deletePortfolioData(
	portfolioUuid: string,
	extractDate: Date
): Promise<DatabaseOperationResult> {
	try {
		const result = await db
			.delete(portfolioData)
			.where(
				and(
					eq(portfolioData.portfolio_id, portfolioUuid),
					eq(portfolioData.extract_date, extractDate.toISOString().split('T')[0])
				)
			)

		const rowsDeleted = result.length || 0
		console.log(`[DB] Deleted ${rowsDeleted} existing rows for portfolio UUID ${portfolioUuid} on ${extractDate.toDateString()}`)
		
		return {
			success: true,
			rowsAffected: rowsDeleted,
			errors: []
		}
	} catch (error) {
		console.error(`[DB] Error deleting portfolio data:`, error)
		return {
			success: false,
			rowsAffected: 0,
			errors: [`Failed to delete existing data: ${error}`]
		}
	}
}

/**
 * Insert new portfolio data
 * Part of the delete-and-replace strategy
 */
export async function insertPortfolioData(
	dataRows: PortfolioDataInsert[]
): Promise<DatabaseOperationResult> {
	if (dataRows.length === 0) {
		return {
			success: true,
			rowsAffected: 0,
			errors: []
		}
	}

	try {
		// Convert to database format
		const insertData: NewPortfolioData[] = dataRows.map(row => ({
			portfolio_id: row.portfolio_id,
			extract_date: row.extract_date.toISOString().split('T')[0],
			balance: row.balance?.toString(),
			label: row.label,
			currency: row.currency,
			valuation_eur: row.valuation_eur?.toString(),
			weight_pct: row.weight_pct?.toString(),
			isin: row.isin,
			pnl_eur: row.pnl_eur?.toString(),
			fees_eur: row.fees_eur?.toString(),
			asset_name: row.asset_name,
			strategy: row.strategy,
			bucket: row.bucket
		}))

		// Batch insert
		await db.insert(portfolioData).values(insertData)
		const rowsInserted = dataRows.length // Use length since rowCount is not available
		
		console.log(`[DB] Inserted ${rowsInserted} new rows`)
		
		return {
			success: true,
			rowsAffected: rowsInserted,
			errors: []
		}
	} catch (error) {
		console.error(`[DB] Error inserting portfolio data:`, error)
		return {
			success: false,
			rowsAffected: 0,
			errors: [`Failed to insert new data: ${error}`]
		}
	}
}

/**
 * Perform complete delete-and-replace operation within a transaction
 */
export async function replacePortfolioData(
	businessPortfolioId: string,
	extractDate: Date,
	newData: PortfolioDataInsert[]
): Promise<DatabaseOperationResult> {
	try {
		return await db.transaction(async () => {
			// Step 1: Ensure portfolio exists and get UUID
			const portfolioResult = await createOrUpdatePortfolio(businessPortfolioId)
			if (!portfolioResult.success || !portfolioResult.portfolioUuid) {
				throw new Error(`Portfolio creation failed: ${portfolioResult.errors.join(', ')}`)
			}

			const portfolioUuid = portfolioResult.portfolioUuid

			// Step 2: Update newData to use the UUID instead of business ID
			const dataWithUuid = newData.map(row => ({
				...row,
				portfolio_id: portfolioUuid
			}))

			// Step 3: Delete existing data
			const deleteResult = await deletePortfolioData(portfolioUuid, extractDate)
			if (!deleteResult.success) {
				throw new Error(`Data deletion failed: ${deleteResult.errors.join(', ')}`)
			}

			// Step 4: Insert new data
			const insertResult = await insertPortfolioData(dataWithUuid)
			if (!insertResult.success) {
				throw new Error(`Data insertion failed: ${insertResult.errors.join(', ')}`)
			}

			console.log(`[DB] Transaction completed successfully for business portfolio ${businessPortfolioId} (UUID: ${portfolioUuid})`)
			
			return {
				success: true,
				rowsAffected: insertResult.rowsAffected,
				errors: []
			}
		})
	} catch (error) {
		console.error(`[DB] Transaction failed for business portfolio ${businessPortfolioId}:`, error)
		return {
			success: false,
			rowsAffected: 0,
			errors: [`Transaction failed: ${error}`]
		}
	}
}

/**
 * Create ingestion log entry for audit trail
 */
export async function createIngestionLog(
	businessPortfolioId: string,
	fileName: string,
	extractDate: Date,
	rowsProcessed: number,
	status: 'success' | 'error' | 'partial',
	errorMessage?: string
): Promise<DatabaseOperationResult> {
	try {
		// Get the UUID for the business portfolio ID
		const existingPortfolio = await db
			.select({ id: portfolio.id })
			.from(portfolio)
			.where(eq(portfolio.business_portfolio_id, businessPortfolioId))
			.limit(1)

		if (existingPortfolio.length === 0) {
			return {
				success: false,
				rowsAffected: 0,
				errors: [`Portfolio not found for business ID: ${businessPortfolioId}`]
			}
		}

		const portfolioUuid = existingPortfolio[0].id

		const logEntry: NewIngestionLog = {
			portfolio_id: portfolioUuid,
			file_name: fileName,
			extract_date: extractDate.toISOString().split('T')[0],
			rows_processed: rowsProcessed,
			status,
			error_message: errorMessage,
			processed_by: 'ingestion-cli' // Could be 'api' or user identifier
		}

		await db.insert(ingestionLog).values(logEntry)
		
		return {
			success: true,
			rowsAffected: 1,
			errors: []
		}
	} catch (error) {
		console.error(`[DB] Error creating ingestion log:`, error)
		return {
			success: false,
			rowsAffected: 0,
			errors: [`Failed to create audit log: ${error}`]
		}
	}
} 