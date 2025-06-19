import type { BucketDetailData } from '@/lib/data/slide-interfaces'

interface ColumnConfig {
	key: string
	header: string
	align: 'left' | 'center'
	dataKey: keyof BucketDetailData['fundsTable'][0]
	footerValue?: (data: BucketDetailData) => string
	width?: string
}

export const liquidTableConfig: ColumnConfig[] = [
	{
		key: 'libelle',
		header: 'LIBELLÉ DU FONDS',
		align: 'left',
		dataKey: 'libelle'
	},
	{
		key: 'strategie',
		header: 'STRATÉGIE',
		align: 'center',
		dataKey: 'strategie'
	},
	{
		key: 'valorisation',
		header: 'VALORISATION',
		align: 'center',
		dataKey: 'valorisation',
		footerValue: (data) => data.bucketInfo.totalFormatted
	},
	{
		key: 'performancePercent',
		header: 'PERFORMANCE (%)',
		align: 'center',
		dataKey: 'performancePercent',
		footerValue: (data) => {
			// Calculate bucket-level performance using total valuation and total PnL
			// This matches the calculation used in the zoom page poche cards
			let totalValuation = 0
			let totalPnl = 0
			
			data.fundsTable.forEach(fund => {
				// Parse valuation (handle both string and number types)
				const valuation = typeof fund.valorisation === 'string' 
					? parseFloat(fund.valorisation.replace(/[€\s,]/g, '')) || 0
					: fund.valorisation || 0
				const pnlEur = parseFloat(fund.performanceEur?.replace(/[€\s,]/g, '') || '0')
				
				totalValuation += valuation
				totalPnl += pnlEur
			})
			
			// Use same formula as zoom page: (valuation / (valuation - pnl)) - 1
			const costBasis = totalValuation - totalPnl
			const bucketPerformance = costBasis > 0 ? ((totalValuation / costBasis) - 1) * 100 : 0
			
			return `${bucketPerformance.toFixed(1)}%`
		}
	},
	{
		key: 'performanceEur',
		header: 'PERFORMANCE (EUR)',
		align: 'center',
		dataKey: 'performanceEur',
		footerValue: (data) => {
			// Calculate total performance EUR for the bucket
			const totalPerformance = data.fundsTable.reduce((sum, fund) => {
				const perfEur = parseFloat(fund.performanceEur?.replace(/[€\s,]/g, '') || '0')
				return sum + perfEur
			}, 0)
			return `${totalPerformance.toLocaleString()} €`
		}
	}
]

export const illiquidTableConfig: ColumnConfig[] = [
	{
		key: 'libelle',
		header: 'LIBELLÉ DU FONDS',
		align: 'left',
		dataKey: 'libelle'
	},
	{
		key: 'strategie',
		header: 'STRATÉGIE',
		align: 'center',
		dataKey: 'strategie'
	},
	{
		key: 'engagement',
		header: 'ENGAGEMENT',
		align: 'center',
		dataKey: 'engagement',
		footerValue: (data) => {
			// Calculate total engagement for LTI bucket
			const totalEngagement = data.fundsTable.reduce((sum, fund) => {
				return sum + (fund.engagement || 0)
			}, 0)
			return `${totalEngagement.toLocaleString()} €`
		}
	},
	{
		key: 'appele',
		header: 'APPELÉ (%)',
		align: 'center',
		dataKey: 'appele',
		footerValue: (data) => {
			// Calculate average appelé percentage
			const totalAppele = data.fundsTable.reduce((sum, fund) => {
				return sum + (fund.appele || 0)
			}, 0)
			return `${(totalAppele / data.fundsTable.length).toFixed(1)}%`
		}
	},
	{
		key: 'tvpi',
		header: 'TVPI',
		align: 'center',
		dataKey: 'tvpi',
		width: 'w-32',
		footerValue: (data) => {
			// Calculate average TVPI
			const totalTVPI = data.fundsTable.reduce((sum, fund) => {
				return sum + (fund.tvpi || 0)
			}, 0)
			return `${(totalTVPI / data.fundsTable.length).toFixed(2)}`
		}
	},
	{
		key: 'valorisation',
		header: 'VALORISATION',
		align: 'center',
		dataKey: 'valorisation',
		footerValue: (data) => data.bucketInfo.totalFormatted
	}
]

export const liquidTableFooterNote = (data: BucketDetailData) => `Performance depuis l'ouverture du contrat, à date du ${data.extractDate}`

export const illiquidTableFooterNote = (data: BucketDetailData) => `Performance depuis l'ouverture du contrat, à date du ${data.extractDate}` 