import GenericDetailPage from './blocks/generic-detail-page'
import { illiquidPageConfig } from './detail-page-configs'
import type { Slide6Data } from '@/lib/data/slide-interfaces'

interface DetailIlliquidProps {
	data: Slide6Data | null
}

export default function DetailIlliquid({ data }: DetailIlliquidProps) {
	return <GenericDetailPage config={illiquidPageConfig} data={data} />
} 