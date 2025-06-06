import GenericTable from './generic-table'
import { liquidTableConfig, liquidTableFooterNote } from './table-config'

export default function TableDetail() {
	return (
		<GenericTable 
			columns={liquidTableConfig}
			footerNote={liquidTableFooterNote}
		/>
	)
}
