import { NextRequest, NextResponse } from 'next/server'
import { generatePdfFromUrl, getBaseUrl } from '@/lib/pdf/generator'
import { z } from 'zod'

// Request validation schema
const exportPdfRequestSchema = z.object({
	portfolioId: z.string().min(1, 'portfolioId is required')
})

interface RouteParams {
	params: {
		portfolioId: string
	}
}

export const runtime = 'nodejs'

/**
 * GET /api/portfolio/[portfolioId]/export-pdf
 * Generates and downloads a PDF of the portfolio slides
 */
export async function GET(
	request: NextRequest,
	{ params }: RouteParams
): Promise<NextResponse> {
	try {
		// Extract and validate parameters
		const { portfolioId } = await params
		
		// Validate required parameters
		const validation = exportPdfRequestSchema.safeParse({ portfolioId })
		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: validation.error.errors.map(e => e.message).join(', ')
				},
				{ status: 400 }
			)
		}

		// Log request for monitoring
		console.log(`[API] Generating PDF for portfolioId: ${portfolioId}`)
		
		// Construct the print URL
		const baseUrl = getBaseUrl()
		const printUrl = `${baseUrl}/print/portfolio/${encodeURIComponent(portfolioId)}`
		
		console.log(`[API] Navigating to print URL: ${printUrl}`)

		// Generate PDF using Playwright
		const pdfBuffer = await generatePdfFromUrl(printUrl, {
			format: 'A3',
			landscape: true,
			printBackground: true,
			margin: {
				top: '12.7mm',
				bottom: '12.7mm', 
				left: '12.7mm',
				right: '12.7mm'
			},
			timeout: 20000 // 20 second timeout for complex slides
		})

		// Prepare filename
		const filename = `portfolio_${portfolioId}.pdf`
		
		console.log(`[API] PDF generated successfully, size: ${pdfBuffer.length} bytes`)

		// Return PDF as downloadable attachment
		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Content-Length': pdfBuffer.length.toString(),
				'Cache-Control': 'no-cache'
			}
		})

	} catch (error) {
		// Log error for monitoring
		console.error('[API] Error in export-pdf endpoint:', error)
		
		// Return error response
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to generate PDF'
			},
			{ status: 500 }
		)
	}
} 