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
	portfolioId: string,
	portfolioName?: string
): Promise<DatabaseOperationResult> {
	try {
		// Check if portfolio exists
		const existingPortfolio = await db
			.select()
			.from(portfolio)
			.where(eq(portfolio.id, portfolioId))
			.limit(1)

		if (existingPortfolio.length === 0) {
			// Create new portfolio
			const newPortfolio: NewPortfolio = {
				id: portfolioId,
				name: portfolioName || `Portfolio ${portfolioId}`,
				client_email: `client-${portfolioId}@example.com` // Placeholder email
			}

			await db.insert(portfolio).values(newPortfolio)
			
			console.log(`[DB] Created new portfolio: ${portfolioId}`)
			return {
				success: true,
				rowsAffected: 1,
				errors: []
			}
		} else {
			// Portfolio exists, optionally update name
			if (portfolioName && existingPortfolio[0].name !== portfolioName) {
				await db
					.update(portfolio)
					.set({ name: portfolioName })
					.where(eq(portfolio.id, portfolioId))
				
				console.log(`[DB] Updated portfolio name for: ${portfolioId}`)
			}
			
			return {
				success: true,
				rowsAffected: 0, // No new rows created
				errors: []
			}
		}
	} catch (error) {
		console.error(`[DB] Error creating/updating portfolio ${portfolioId}:`, error)
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
	portfolioId: string,
	extractDate: Date
): Promise<DatabaseOperationResult> {
	try {
		const result = await db
			.delete(portfolioData)
			.where(
				and(
					eq(portfolioData.portfolio_id, portfolioId),
					eq(portfolioData.extract_date, extractDate.toISOString().split('T')[0])
				)
			)

		const rowsDeleted = result.length || 0
		console.log(`[DB] Deleted ${rowsDeleted} existing rows for portfolio ${portfolioId} on ${extractDate.toDateString()}`)
		
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
			book_price_eur: row.book_price_eur?.toString(),
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
	portfolioId: string,
	extractDate: Date,
	newData: PortfolioDataInsert[]
): Promise<DatabaseOperationResult> {
	try {
		return await db.transaction(async () => {
			// Step 1: Ensure portfolio exists
			const portfolioResult = await createOrUpdatePortfolio(portfolioId)
			if (!portfolioResult.success) {
				throw new Error(`Portfolio creation failed: ${portfolioResult.errors.join(', ')}`)
			}

			// Step 2: Delete existing data
			const deleteResult = await deletePortfolioData(portfolioId, extractDate)
			if (!deleteResult.success) {
				throw new Error(`Data deletion failed: ${deleteResult.errors.join(', ')}`)
			}

			// Step 3: Insert new data
			const insertResult = await insertPortfolioData(newData)
			if (!insertResult.success) {
				throw new Error(`Data insertion failed: ${insertResult.errors.join(', ')}`)
			}

			console.log(`[DB] Transaction completed successfully for portfolio ${portfolioId}`)
			
			return {
				success: true,
				rowsAffected: insertResult.rowsAffected,
				errors: []
			}
		})
	} catch (error) {
		console.error(`[DB] Transaction failed for portfolio ${portfolioId}:`, error)
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
	portfolioId: string,
	fileName: string,
	extractDate: Date,
	rowsProcessed: number,
	status: 'success' | 'error' | 'partial',
	errorMessage?: string
): Promise<DatabaseOperationResult> {
	try {
		const logEntry: NewIngestionLog = {
			portfolio_id: portfolioId,
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