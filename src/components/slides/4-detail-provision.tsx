import GenericDetailPage from './blocks/generic-detail-page'
import { provisionPageConfig } from './detail-page-configs'
import type { Slide4Data } from '@/lib/data/slide-interfaces'

interface DetailProvisionProps {
	data: Slide4Data | null
}

export default function DetailProvision({ data }: DetailProvisionProps) {
	return <GenericDetailPage config={provisionPageConfig} data={data} />
}