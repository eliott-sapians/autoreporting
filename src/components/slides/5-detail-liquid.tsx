import GenericDetailPage from './blocks/generic-detail-page'
import { liquidPageConfig } from './detail-page-configs'
import type { Slide5Data } from '@/lib/data/slide-interfaces'

interface DetailLiquidProps {
	data: Slide5Data | null
}

export default function DetailLiquid({ data }: DetailLiquidProps) {
	return <GenericDetailPage config={liquidPageConfig} data={data} />
}