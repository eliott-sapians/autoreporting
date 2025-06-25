import { pgTable, uuid, text, varchar, timestamp, date, numeric, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Portfolio table for client metadata
export const portfolio = pgTable('portfolio', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	business_portfolio_id: text('business_portfolio_id').unique().notNull(), // Business ID from Excel (e.g., "K00149JV/KLX")
	name: text('name'),
	client_email: text('client_email').unique().notNull(),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
	contractor: text('contractor'), // New: Nom du contractant (assureur)
	consultant: text('consultant'), // New: Consultant / conseiller par défaut
	contract_type: text('contract_type') // New: Type de contrat (ex: Assurance vie Luxembourgeoise)
})

// Portfolio data table with 11 business columns (A-K from Excel)
export const portfolioData = pgTable('portfolio_data', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	portfolio_id: uuid('portfolio_id').references(() => portfolio.id, { onDelete: 'cascade' }).notNull(),
	extract_date: date('extract_date').notNull(),
	
	// Excel Column Mappings (A-K, starting from row 9)
	balance: numeric('balance', { precision: 18, scale: 2 }),          // A: Solde
	label: text('label'),                                              // B: Libellé  
	currency: varchar('currency', { length: 3 }),                     // C: Devise
	valuation_eur: numeric('valuation_eur', { precision: 18, scale: 2 }), // D: Estimation + int. courus (EUR)
	weight_pct: numeric('weight_pct', { precision: 6, scale: 3 }),     // E: Poids (%)
	isin: varchar('isin', { length: 12 }),                            // F: Code ISIN
	pnl_eur: numeric('pnl_eur', { precision: 18, scale: 2 }), // G: B / P - Total (EUR)
	fees_eur: numeric('fees_eur', { precision: 18, scale: 2 }),       // H: Frais (EUR)
	asset_name: text('asset_name'),                                    // I: Nom
	strategy: text('strategy'),                                        // J: Stratégie
	bucket: text('bucket')                                             // K: Poche
})

// Ingestion log table for audit trail
export const ingestionLog = pgTable('ingestion_log', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	portfolio_id: uuid('portfolio_id').references(() => portfolio.id),
	file_name: text('file_name').notNull(),
	extract_date: date('extract_date').notNull(),
	rows_processed: integer('rows_processed').notNull(),
	status: text('status').notNull(), // 'success', 'error', 'partial'
	error_message: text('error_message'),
	processed_at: timestamp('processed_at', { withTimezone: true }).defaultNow(),
	processed_by: text('processed_by')
})

// Export types for TypeScript
export type Portfolio = typeof portfolio.$inferSelect
export type NewPortfolio = typeof portfolio.$inferInsert
export type PortfolioData = typeof portfolioData.$inferSelect
export type NewPortfolioData = typeof portfolioData.$inferInsert
export type IngestionLog = typeof ingestionLog.$inferSelect
export type NewIngestionLog = typeof ingestionLog.$inferInsert 