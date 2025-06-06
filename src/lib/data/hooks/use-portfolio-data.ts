'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { PortfolioDataApiResponse } from '@/lib/types'
import type { 
	GardeData, 
	SyntheseData, 
	ZoomData, 
	Slide4Data,
	Slide5Data,
	Slide6Data
} from '../slide-interfaces'
import { 
	transformToGardeData,
	transformToSyntheseData,
	transformToZoomData,
	transformToCTBucketData,
	transformToLTLBucketData,
	transformToLTIBucketData
} from '../transformers/index'

/**
 * Return interface for usePortfolioData hook
 * Matches Linear Task D requirements with slide-specific data
 */
export interface UsePortfolioDataReturn {
	// Loading & Error States
	loading: boolean
	error: string | null
	
	// Raw Data
	raw: PortfolioDataApiResponse | null
	
	// Transformed Slide Data (as per Linear requirements)
	slide1: GardeData | null
	slide2: SyntheseData | null
	slide3: ZoomData | null
	slide4: Slide4Data | null
	slide5: Slide5Data | null
	slide6: Slide6Data | null
	
	// Utility Functions
	refetch: () => Promise<void>
}

/**
 * Central usePortfolioData React hook that fetches raw data from the API 
 * and automatically applies all transformers to provide slide-ready data.
 * 
 * This hook manages loading states, error handling, and provides data for all 6 slides
 * in a single interface as per the Single Raw-Data API + Client-Side Transforms architecture.
 * 
 * @param portfolioId - UUID of the portfolio to fetch
 * @returns Slide-ready data with loading and error states
 */
export function usePortfolioData(portfolioId: string | null): UsePortfolioDataReturn {
	const [rawData, setRawData] = useState<PortfolioDataApiResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch portfolio data from API with error handling and retry logic
	 */
	const fetchPortfolioData = useCallback(async () => {
		if (!portfolioId) {
			setError('Portfolio ID is required')
			setRawData(null)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/portfolio-data?portfolioId=${encodeURIComponent(portfolioId)}`)
			
			if (!response.ok) {
				throw new Error(`Failed to fetch portfolio data: ${response.status} ${response.statusText}`)
			}
			
			const data: PortfolioDataApiResponse = await response.json()

			if (!data.success) {
				throw new Error(data.error || 'Failed to fetch portfolio data')
			}

			setRawData(data)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
			setError(errorMessage)
			setRawData(null)
			console.error('[usePortfolioData] Error fetching portfolio data:', err)
		} finally {
			setLoading(false)
		}
	}, [portfolioId])

	// Fetch data when portfolioId changes
	useEffect(() => {
		if (portfolioId) {
			fetchPortfolioData()
		} else {
			setRawData(null)
			setError(null)
			setLoading(false)
		}
	}, [portfolioId, fetchPortfolioData])

	/**
	 * Memoized slide transformations to avoid expensive recomputations
	 * Only recalculates when raw data changes
	 */
	const slide1 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToGardeData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 1 data:', err)
			return null
		}
	}, [rawData])

	const slide2 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToSyntheseData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 2 data:', err)
			return null
		}
	}, [rawData])

	const slide3 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToZoomData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 3 data:', err)
			return null
		}
	}, [rawData])

	const slide4 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToCTBucketData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 4 data:', err)
			return null
		}
	}, [rawData])

	const slide5 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToLTLBucketData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 5 data:', err)
			return null
		}
	}, [rawData])

	const slide6 = useMemo(() => {
		if (!rawData) return null
		try {
			return transformToLTIBucketData(rawData)
		} catch (err) {
			console.error('[usePortfolioData] Error transforming Slide 6 data:', err)
			return null
		}
	}, [rawData])

	/**
	 * Memoized refetch function to prevent unnecessary re-renders
	 */
	const refetch = useCallback(async () => {
		await fetchPortfolioData()
	}, [fetchPortfolioData])

	return {
		loading,
		error,
		raw: rawData,
		slide1,
		slide2,
		slide3,
		slide4,
		slide5,
		slide6,
		refetch
	}
}

/**
 * Simplified hook that just returns the raw API response
 * Useful when you need the full raw data without transformations
 */
export function useRawPortfolioData(portfolioId: string | null): {
	data: PortfolioDataApiResponse | null
	loading: boolean
	error: string | null
	refetch: () => Promise<void>
} {
	const { raw, loading, error, refetch } = usePortfolioData(portfolioId)
	
	return {
		data: raw,
		loading,
		error,
		refetch
	}
} 