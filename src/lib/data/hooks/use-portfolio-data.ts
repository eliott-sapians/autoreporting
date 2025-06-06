import { useState, useEffect, useCallback } from 'react'
import type { PortfolioDataApiResponse, FundData, TotalData, ProvisionData } from '@/lib/types'
import { transformToProvisionData, transformToTotalData, transformToFundData, getStrategyAllocation } from '../transformers'

export interface UsePortfolioDataResult {
	// Raw API data
	rawData: PortfolioDataApiResponse | null
	
	// Transformed data for components
	totalData: TotalData | null
	fundsData: FundData[]
	provisionData: ProvisionData | null
	allocationData: Array<{
		name: string
		value: number
		color: string
	}>
	
	// Loading and error states
	isLoading: boolean
	error: string | null
	
	// Utility functions
	refetch: () => Promise<void>
}

/**
 * Custom hook for fetching and transforming portfolio data
 * @param portfolioId - UUID of the portfolio to fetch
 * @returns Transformed portfolio data and loading states
 */
export function usePortfolioData(portfolioId: string | null): UsePortfolioDataResult {
	const [rawData, setRawData] = useState<PortfolioDataApiResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchPortfolioData = useCallback(async () => {
		if (!portfolioId) {
			setError('Portfolio ID is required')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/portfolio-data?portfolioId=${encodeURIComponent(portfolioId)}`)
			const data: PortfolioDataApiResponse = await response.json()

			if (!data.success) {
				throw new Error(data.error || 'Failed to fetch portfolio data')
			}

			setRawData(data)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
			setError(errorMessage)
			console.error('[usePortfolioData] Error fetching portfolio data:', err)
		} finally {
			setIsLoading(false)
		}
	}, [portfolioId])

	// Fetch data when portfolioId changes
	useEffect(() => {
		if (portfolioId) {
			fetchPortfolioData()
		} else {
			setRawData(null)
			setError(null)
		}
	}, [portfolioId, fetchPortfolioData])

	// Transform raw data into component-ready formats
	const totalData = rawData ? transformToTotalData(rawData) : null
	const fundsData = rawData ? transformToFundData(rawData) : []
	const provisionData = rawData ? transformToProvisionData(rawData) : null
	const allocationData = rawData ? getStrategyAllocation(rawData) : []

	return {
		rawData,
		totalData,
		fundsData,
		provisionData,
		allocationData,
		isLoading,
		error,
		refetch: fetchPortfolioData
	}
}

/**
 * Simplified hook that just returns the raw API response
 * Useful when you need the full raw data without transformations
 */
export function useRawPortfolioData(portfolioId: string | null): {
	data: PortfolioDataApiResponse | null
	isLoading: boolean
	error: string | null
	refetch: () => Promise<void>
} {
	const { rawData, isLoading, error, refetch } = usePortfolioData(portfolioId)
	
	return {
		data: rawData,
		isLoading,
		error,
		refetch
	}
} 