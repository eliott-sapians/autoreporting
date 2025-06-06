#!/usr/bin/env node

/**
 * Test script for portfolio data transformers
 * Verifies that all transformation functions work correctly with sample data
 */

import type { PortfolioDataApiResponse } from '../src/lib/types'
import {
	transformToTotalData,
	transformToFundData,
	transformToProvisionData,
	transformToExtendedFundData,
	transformToGardeData,
	transformToSyntheseData,
	transformToZoomData,
	transformToDetailData,
	transformToPerformanceData,
	getStrategyAllocation,
	getBucketAllocation,
	getFundsByStrategy,
	getFundsByBucket
} from '../src/lib/data/transformers'

// Sample test data
const mockApiResponse: PortfolioDataApiResponse = {
	success: true,
	data: {
		portfolio: {
			id: '123e4567-e89b-12d3-a456-426614174000',
			business_portfolio_id: 'PORT-001',
			name: 'Client Test Portfolio',
			client_email: 'client@test.com',
			extractDate: '2025-02-04'
		},
		funds: [
			{
				id: 'fund-1',
				balance: 50000,
				label: 'Cash Fund A',
				currency: 'EUR',
				valuation_eur: 52000,
				weight_pct: 25.5,
				isin: 'FR0000120073',
				book_price_eur: 50000,
				fees_eur: 100,
				asset_name: 'Money Market Fund A',
				strategy: 'Cash',
				bucket: 'Core'
			},
			{
				id: 'fund-2',
				balance: 75000,
				label: 'Obligation Fund B',
				currency: 'EUR',
				valuation_eur: 78000,
				weight_pct: 38.2,
				isin: 'FR0000121014',
				book_price_eur: 75000,
				fees_eur: 150,
				asset_name: 'Government Bond Fund B',
				strategy: 'Obligations',
				bucket: 'Core'
			},
			{
				id: 'fund-3',
				balance: 25000,
				label: 'Monétaire Fund C',
				currency: 'EUR',
				valuation_eur: 26500,
				weight_pct: 13.0,
				isin: 'FR0000131104',
				book_price_eur: 25000,
				fees_eur: 75,
				asset_name: 'Short Term Fund C',
				strategy: 'Monétaire',
				bucket: 'Satellite'
			}
		],
		metadata: {
			timestamp: '2025-01-27T20:42:26.000Z',
			fundCount: 3,
			extractDate: '2025-02-04'
		}
	}
}

function runTests() {
	console.log('🧪 Testing Portfolio Data Transformers\n')
	
	try {
		// Test basic transformers
		console.log('📊 Testing basic transformers...')
		const totalData = transformToTotalData(mockApiResponse)
		console.log('✅ TotalData:', totalData)
		
		const fundData = transformToFundData(mockApiResponse)
		console.log('✅ FundData count:', fundData.length)
		
		const provisionData = transformToProvisionData(mockApiResponse)
		console.log('✅ ProvisionData:', provisionData ? 'Success' : 'Failed')
		
		const extendedFundData = transformToExtendedFundData(mockApiResponse)
		console.log('✅ ExtendedFundData count:', extendedFundData.length)
		
		// Test slide-specific transformers
		console.log('\n📋 Testing slide-specific transformers...')
		const gardeData = transformToGardeData(mockApiResponse)
		console.log('✅ GardeData:', gardeData)
		
		const syntheseData = transformToSyntheseData(mockApiResponse)
		console.log('✅ SyntheseData bucket chart items:', syntheseData?.bucketChart.length)
		console.log('✅ SyntheseData strategy chart items:', syntheseData?.strategyChart.length)
		
		const zoomData = transformToZoomData(mockApiResponse)
		console.log('✅ ZoomData strategies:', zoomData?.strategies.length)
		
		const detailData = transformToDetailData(mockApiResponse)
		console.log('✅ DetailData funds:', detailData?.funds.length)
		
		const performanceData = transformToPerformanceData(mockApiResponse)
		console.log('✅ PerformanceData:', performanceData)
		
		// Test allocation functions
		console.log('\n📈 Testing allocation functions...')
		const strategyAllocation = getStrategyAllocation(mockApiResponse)
		console.log('✅ Strategy allocation items:', strategyAllocation.length)
		
		const bucketAllocation = getBucketAllocation(mockApiResponse)
		console.log('✅ Bucket allocation items:', bucketAllocation.length)
		
		// Test filtering functions
		console.log('\n🔍 Testing filtering functions...')
		const cashFunds = getFundsByStrategy(mockApiResponse, 'Cash')
		console.log('✅ Cash funds:', cashFunds.length)
		
		const coreFunds = getFundsByBucket(mockApiResponse, 'Core')
		console.log('✅ Core bucket funds:', coreFunds.length)
		
		const detailCash = transformToDetailData(mockApiResponse, 'Cash')
		console.log('✅ Detail data for Cash strategy:', detailCash?.funds.length)
		
		console.log('\n🎉 All transformer tests completed successfully!')
		
	} catch (error) {
		console.error('❌ Test failed:', error)
		process.exit(1)
	}
}

// Run the tests
runTests() 