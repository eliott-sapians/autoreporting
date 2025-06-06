import GenericTable from './generic-table'
import { illiquidTableConfig, illiquidTableFooterNote } from './table-config'

export default function TableIlliquid() {
	return (
		<GenericTable 
			columns={illiquidTableConfig}
			footerNote={illiquidTableFooterNote}
		/>
	)
}
