import type { FundData, TotalData } from '@/lib/types'

interface ColumnConfig {
	key: string
	header: string
	align: 'left' | 'center'
	dataKey: keyof FundData
	footerValue?: (totalData: TotalData) => string
}

export const liquidTableConfig: ColumnConfig[] = [
	{
		key: 'name',
		header: 'LIBELLÉ DU FONDS',
		align: 'left',
		dataKey: 'name'
	},
	{
		key: 'strategy',
		header: 'STRATÉGIE',
		align: 'center',
		dataKey: 'strategy'
	},
	{
		key: 'valuation',
		header: 'VALORISATION',
		align: 'center',
		dataKey: 'valuation',
		footerValue: (total) => total.total
	},
	{
		key: 'performance',
		header: 'PERFORMANCE (%)',
		align: 'center',
		dataKey: 'performance',
		footerValue: (total) => total.performance
	},
	{
		key: 'performanceEur',
		header: 'PERFORMANCE (EUR)',
		align: 'center',
		dataKey: 'performanceEur',
		footerValue: (total) => total.performanceEur
	}
]

export const illiquidTableConfig: ColumnConfig[] = [
	{
		key: 'name',
		header: 'LIBELLÉ DU FONDS',
		align: 'left',
		dataKey: 'name'
	},
	{
		key: 'strategy',
		header: 'STRATÉGIE',
		align: 'center',
		dataKey: 'strategy'
	},
	{
		key: 'engagement',
		header: 'ENGAGEMENT',
		align: 'center',
		dataKey: 'valuation',
		footerValue: (total) => total.total
	},
	{
		key: 'called',
		header: 'APPELÉ',
		align: 'center',
		dataKey: 'performance',
		footerValue: (total) => total.performance
	},
	{
		key: 'tvpi',
		header: 'TVPI',
		align: 'center',
		dataKey: 'performanceEur',
		footerValue: (total) => total.performanceEur
	},
	{
		key: 'valuation',
		header: 'VALORISATION',
		align: 'center',
		dataKey: 'valuation',
		footerValue: (total) => total.total
	}
]

export const liquidTableFooterNote = 'Performance depuis l\'ouverture du contrat, à date du /insert date here/'
export const illiquidTableFooterNote = 'Performance depuis l\'ouverture du contrat, à date du /insert date here/' 