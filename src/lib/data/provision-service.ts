import type { ProvisionData } from '@/lib/types'
import provisionData from './provision-data.json'

/**
 * Get provision data
 * TODO: Replace with actual API call when backend is ready
 * @returns Promise<ProvisionData> - The provision data
 */
export async function getProvisionData(): Promise<ProvisionData> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 100))
	return provisionData as ProvisionData
}

/**
 * Get total data only
 * @returns Promise<TotalData> - Just the total data
 */
export async function getTotalData() {
	const data = await getProvisionData()
	return data.total
}

/**
 * Get funds data only
 * @returns Promise<FundData[]> - Just the funds data
 */
export async function getFundsData() {
	const data = await getProvisionData()
	return data.funds
} 