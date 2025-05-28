export interface FundData {
	name: string
	strategy: string
	valuation: string
	performance: string
	performanceEur: string
}

export interface TotalData {
	total: string
	performance: string
	performanceEur: string
}

export interface ProvisionData {
	funds: FundData[]
	total: TotalData
} 