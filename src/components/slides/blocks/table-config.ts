import type { BucketDetailData } from '@/lib/data/slide-interfaces'

interface ColumnConfig {
	key: string
	header: string
	align: 'left' | 'center'
	dataKey: keyof BucketDetailData['fundsTable'][0]
	footerValue?: (data: BucketDetailData) => string
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
			// Calculate average performance for the bucket
			const totalPerformance = data.fundsTable.reduce((sum, fund) => {
				const perf = parseFloat(fund.performancePercent?.replace('%', '') || '0')
				return sum + perf
			}, 0)
			return `${(totalPerformance / data.fundsTable.length).toFixed(1)}%`
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

export const liquidTableFooterNote = 'Performance depuis l\'ouverture du contrat, à date du /insert date here/'
export const illiquidTableFooterNote = 'Performance depuis l\'ouverture du contrat, à date du /insert date here/' 