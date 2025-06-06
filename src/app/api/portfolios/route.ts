import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolio, portfolioData } from '@/lib/db/schema'
import { sql, max, eq } from 'drizzle-orm'

export interface Portfolio {
	id: string
	clientName: string
	lastExtractionDate: string
}

export async function GET() {
	try {
		// Query to get portfolios with their latest extraction date
		const portfolios = await db
			.select({
				id: portfolio.business_portfolio_id,
				clientName: portfolio.name,
				lastExtractionDate: max(portfolioData.extract_date)
			})
			.from(portfolio)
			.leftJoin(portfolioData, eq(portfolio.id, portfolioData.portfolio_id))
			.groupBy(portfolio.id, portfolio.business_portfolio_id, portfolio.name)
			.orderBy(sql`${max(portfolioData.extract_date)} DESC NULLS LAST`)

		// Format the response
		const formattedPortfolios: Portfolio[] = portfolios.map(p => ({
			id: p.id || 'N/A',
			clientName: p.clientName || 'Nom non défini',
			lastExtractionDate: p.lastExtractionDate 
				? new Date(p.lastExtractionDate).toLocaleDateString('fr-FR')
				: 'Aucune extraction'
		}))

		return NextResponse.json(formattedPortfolios)
	} catch (error) {
		console.error('Error fetching portfolios:', error)
		return NextResponse.json(
			{ error: 'Erreur lors de la récupération des portefeuilles' },
			{ status: 500 }
		)
	}
}