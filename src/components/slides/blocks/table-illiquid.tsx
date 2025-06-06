import GenericTable from './generic-table'
import { illiquidTableConfig, illiquidTableFooterNote } from './table-config'
import type { BucketDetailData } from '@/lib/data/slide-interfaces'

interface TableIlliquidProps {
	data: BucketDetailData
}

export default function TableIlliquid({ data }: TableIlliquidProps) {
	return (
		<GenericTable 
			columns={illiquidTableConfig}
			footerNote={illiquidTableFooterNote}
			data={data}
		/>
	)
}
