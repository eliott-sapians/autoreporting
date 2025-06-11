export interface FundData {
	name: string
	strategy: string
	valuation: string
	performance: string
	performanceEur: string
}

export interface ExtendedFundData extends FundData {
	bucket?: string
	isin?: string
	currency?: string
	balance?: string
	fees?: string
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

export interface PortfolioDataApiResponse {
	success: boolean
	data?: {
		portfolio: {
			id: string
			business_portfolio_id: string
			name: string
			client_email: string
			extractDate: string
		}
		funds: Array<{
			id: string
			balance: number | null
			label: string | null
			currency: string | null
			valuation_eur: number | null
			weight_pct: number | null
			isin: string | null
			pnl_eur: number | null
			fees_eur: number | null
			asset_name: string | null
			strategy: string | null
			bucket: string | null
		}>
		metadata: {
			timestamp: string
			fundCount: number
			extractDate: string
		}
	}
	error?: string
}

export interface RawPortfolioData {
	portfolio: {
		id: string
		business_portfolio_id: string
		name: string
		client_email: string
		extractDate: string
	}
	funds: Array<{
		id: string
		balance: number | null
		label: string | null
		currency: string | null
		valuation_eur: number | null
		weight_pct: number | null
		isin: string | null
		pnl_eur: number | null
		fees_eur: number | null
		asset_name: string | null
		strategy: string | null
		bucket: string | null
	}>
} 