import type { DetailPageConfig } from './blocks/generic-detail-page'

export const liquidPageConfig: DetailPageConfig = {
	title: 'Détail de la poche',
	titleHighlight: 'long-terme liquide',
	tableComponent: 'TableDetail',
	chartId: 'allocation-liquid'
}

export const provisionPageConfig: DetailPageConfig = {
	title: 'Détail de la poche',
	titleHighlight: 'long-terme provision',
	tableComponent: 'TableDetail',
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
	tableComponent: 'TableIlliquid',
	chartId: 'allocation-illiquid'
} 