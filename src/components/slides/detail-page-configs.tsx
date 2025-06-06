import TableDetail from './blocks/table-detail'
import TableIlliquid from './blocks/table-illiquid'
import type { DetailPageConfig } from './blocks/generic-detail-page'

export const liquidPageConfig: DetailPageConfig = {
	title: 'Détail de la poche',
	titleHighlight: 'long-terme liquide',
	tableComponent: TableDetail,
	chartId: 'allocation-liquid'
}

export const provisionPageConfig: DetailPageConfig = {
	title: 'Détail de la poche',
	titleHighlight: 'long-terme provision',
	sections: [
		{
			type: 'subtitle',
			content: 'Performance depuis l\'ouverture du contrat, à date du 04.02.2025'
		}
	],
	tableComponent: TableDetail,
	chartId: 'allocation-provision'
}

export const illiquidPageConfig: DetailPageConfig = {
	title: 'Détail de la poche',
	titleHighlight: 'long-terme illiquide',
	sections: [
		{
			type: 'remaining-deploy'
		}
	],
	tableComponent: TableIlliquid,
	chartId: 'allocation-illiquid'
} 