import GenericTable from './generic-table'
import { liquidTableConfig, liquidTableFooterNote } from './table-config'
import type { BucketDetailData } from '@/lib/data/slide-interfaces'

interface TableDetailProps {
	data: BucketDetailData
}

export default function TableDetail({ data }: TableDetailProps) {
	return (
		<GenericTable 
			columns={liquidTableConfig}
			footerNote={liquidTableFooterNote}
			data={data}
		/>
	)
}
