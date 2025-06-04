import { db } from './index'
import { portfolio, portfolioData, ingestionLog } from './schema'
import { eq } from 'drizzle-orm'

export async function testDatabaseConnection() {
	try {
		console.log('🔍 Testing database connection...')
		
		// Test basic query
		const result = await db.select().from(portfolio).limit(1)
		console.log('✅ Database connection successful')
		
		// Test insert and cleanup
		console.log('🧪 Testing schema operations...')
		
		const testPortfolio = await db.insert(portfolio).values({
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
		return false
	}
}

// Run test if this file is executed directly
if (require.main === module) {
	testDatabaseConnection()
} 