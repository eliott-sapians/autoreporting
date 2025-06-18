import { chromium } from '@playwright/test'

export interface PdfGenerationOptions {
	format?: 'A3' | 'A4' | 'Letter'
	landscape?: boolean
	printBackground?: boolean
	margin?: {
		top?: string | number
		bottom?: string | number
		left?: string | number
		right?: string | number
	}
	timeout?: number
}

const DEFAULT_OPTIONS: Required<PdfGenerationOptions> = {
	format: 'A3',
	landscape: true,
	printBackground: true,
	margin: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	timeout: 15000
}

/**
 * Generate PDF from a URL using Playwright
 * @param url - The URL to navigate to and convert to PDF
 * @param options - PDF generation options
 * @returns Promise<Buffer> - The PDF buffer
 */
export async function generatePdfFromUrl(
	url: string,
	options: PdfGenerationOptions = {}
): Promise<Buffer> {
	const opts = { ...DEFAULT_OPTIONS, ...options }
	
	let browser
	try {
		// Launch browser
		browser = await chromium.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--disable-gpu'
			]
		})

		const page = await browser.newPage()

		// Navigate to URL and wait for content
		await page.goto(url, { 
			waitUntil: 'networkidle',
			timeout: opts.timeout 
		})

		// Extra delay to allow any client-side hydration / charts to finish
		await page.waitForTimeout(2000)

		// Attempt to log any console errors from the page (helpful during debugging)
		page.on('console', msg => {
			if (msg.type() === 'error') {
				console.error(`[Playwright Console Error] ${msg.text()}`)
			}
		})

		// Generate PDF
		const pdfBuffer = await page.pdf({
			format: opts.format,
			landscape: opts.landscape,
			printBackground: opts.printBackground,
			margin: opts.margin
		})

		return Buffer.from(pdfBuffer)

	} catch (error) {
		console.error('PDF generation failed:', error)
		throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
	} finally {
		if (browser) {
			await browser.close()
		}
	}
}

/**
 * Helper to get the base URL for the current environment
 */
export function getBaseUrl(): string {
	// In production, use NEXT_PUBLIC_APP_URL or construct from headers
	if (process.env.NODE_ENV === 'production') {
		return process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'
	}
	
	// In development, use localhost
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
} 