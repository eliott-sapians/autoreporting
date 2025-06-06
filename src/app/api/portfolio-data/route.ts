import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/lib/data/portfolio-service'
import { z } from 'zod'
import type { PortfolioDataApiResponse } from '@/lib/types'

// Request validation schema - Allow any string ID (business or internal UUID)
const portfolioDataRequestSchema = z.object({
	portfolioId: z.string().min(1, 'portfolioId is required')
})



/**
 * GET /api/portfolio-data
 * Returns complete raw portfolio data for a given portfolioId
 * Query Parameters:
 * - portfolioId: Business portfolio ID or internal UUID of the portfolio to retrieve
 */
export async function GET(request: NextRequest): Promise<NextResponse<PortfolioDataApiResponse>> {
	try {
		// Extract and validate query parameters
		const { searchParams } = new URL(request.url)
		const portfolioId = searchParams.get('portfolioId')
		
		// Validate required parameters
		const validation = portfolioDataRequestSchema.safeParse({ portfolioId })
		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: validation.error.errors.map(e => e.message).join(', ')
				},
				{ 
					status: 400,
					headers: {
						'Cache-Control': 'no-cache'
					}
				}
			)
		}

		// Log request for monitoring
		console.log(`[API] Fetching portfolio data for portfolioId: ${portfolioId}`)
		
		// First try to find by business portfolio ID, then by internal ID
		let rawData = await portfolioService.getRawPortfolioDataByBusinessId(validation.data.portfolioId)
		
		// If not found by business ID, try by internal UUID
		if (!rawData) {
			rawData = await portfolioService.getRawPortfolioData(validation.data.portfolioId)
		}
		
		// Handle portfolio not found
		if (!rawData) {
			return NextResponse.json(
				{
					success: false,
					error: 'Portfolio not found'
				},
				{ 
					status: 404,
					headers: {
						'Cache-Control': 'no-cache'
					}
				}
			)
		}

		// Prepare response with metadata
		const response: PortfolioDataApiResponse = {
			success: true,
			data: {
				portfolio: rawData.portfolio,
				funds: rawData.funds,
				metadata: {
					timestamp: new Date().toISOString(),
					fundCount: rawData.funds.length,
					extractDate: rawData.portfolio.extractDate
				}
			}
		}

		// Return successful response with caching headers
		return NextResponse.json(response, {
			status: 200,
			headers: {
				'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5min cache, 10min stale
				'Content-Type': 'application/json'
			}
		})

	} catch (error) {
		// Log error for monitoring
		console.error('[API] Error in portfolio-data endpoint:', error)
		
		// Return internal server error
		return NextResponse.json(
			{
				success: false,
				error: 'Internal server error'
			},
			{ 
				status: 500,
				headers: {
					'Cache-Control': 'no-cache'
				}
			}
		)
	}
} 