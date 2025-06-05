import { config } from 'dotenv'
import { db } from './index'
import { portfolio, portfolioData, ingestionLog } from './schema'
import { eq } from 'drizzle-orm'

// Load environment variables
config({ path: '.env.local' })

export async function testDatabaseConnection() {
	try {
		console.log('🔍 Testing database connection...')
		console.log('Database URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No')
		console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
		
		// Test basic query
		const result = await db.select().from(portfolio).limit(1)
		console.log('✅ Database connection successful')
		console.log('Found portfolios:', result.length)
		
		// Test insert and cleanup
		console.log('🧪 Testing schema operations...')
		
		const testPortfolio = await db.insert(portfolio).values({
			business_portfolio_id: `test-${Date.now()}`,
			name: 'Test Portfolio',
			client_email: `test-${Date.now()}@example.com`
		}).returning()
		
		console.log('✅ Portfolio insertion successful')
		
		// Clean up test data
		await db.delete(portfolio).where(eq(portfolio.id, testPortfolio[0].id))
		console.log('✅ Test data cleanup successful')
		
		console.log('🎉 All database tests passed!')
		return true
		
	} catch (error) {
		console.error('❌ Database test failed:', error)
		console.error('Error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			code: (error as any)?.code,
			DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set'
		})
		return false
	}
}

// Run test if this file is executed directly
if (require.main === module) {
	testDatabaseConnection().then(success => {
		process.exit(success ? 0 : 1)
	})
} 