'use client'

import { useState, useEffect, useRef } from 'react'
import { 
	Table, 
	TableHeader, 
	TableRow, 
	TableHead, 
	TableBody, 
	TableCell, 
	TableFooter 
} from '@/components/ui/table'
import type { FundData, TotalData } from '@/lib/types'
import { getProvisionData } from '@/lib/data/provision-service'

interface ColumnConfig {
	key: string
	header: string
	align: 'left' | 'center'
	dataKey: keyof FundData
	formatter?: (value: string, fund: FundData) => React.ReactNode
	footerValue?: (totalData: TotalData) => string
	footerFormatter?: (value: string, totalData: TotalData) => React.ReactNode
}

interface GenericTableProps {
	columns: ColumnConfig[]
	footerNote?: string
}

export default function GenericTable({ columns, footerNote }: GenericTableProps) {
	const [fundData, setFundData] = useState<FundData[]>([])
	const [totalData, setTotalData] = useState<TotalData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [tableHeight, setTableHeight] = useState<number>(0)
	const tableContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		async function loadData() {
			try {
				const data = await getProvisionData()
				setFundData(data.funds)
				setTotalData(data.total)
			} catch (error) {
				console.error('Error loading provision data:', error)
			} finally {
				setIsLoading(false)
			}
		}
		loadData()
	}, [])

	useEffect(() => {
		const updateTableHeight = () => {
			if (tableContainerRef.current) {
				const containerHeight = tableContainerRef.current.clientHeight
				setTableHeight(containerHeight)
			}
		}

		updateTableHeight()
		window.addEventListener('resize', updateTableHeight)
		return () => window.removeEventListener('resize', updateTableHeight)
	}, [])

	if (isLoading) {
		return (
			<div ref={tableContainerRef} className="w-full h-full overflow-hidden">
				<div className="p-6 text-center text-muted-foreground">
					Chargement des données...
				</div>
			</div>
		)
	}

	if (!totalData) {
		return (
			<div ref={tableContainerRef} className="w-full h-full overflow-hidden">
				<div className="p-6 text-center text-destructive">
					Erreur lors du chargement des données
				</div>
			</div>
		)
	}

	// Fixed heights
	const headerHeight = 96 // h-24 = 6rem = 96px
	const footerHeight = 96 // h-24 = 6rem = 96px
	const naturalBodyRowHeight = 72 // Natural row height (equivalent to py-6 with content)
	
	// Calculate if we need to compress rows
	const naturalTableHeight = headerHeight + (fundData.length * naturalBodyRowHeight) + footerHeight
	const needsCompression = naturalTableHeight > tableHeight
	
	// Calculate actual row height
	const bodyRowHeight = needsCompression 
		? Math.max(48, (tableHeight - headerHeight - footerHeight) / fundData.length) // Minimum 48px per row
		: naturalBodyRowHeight

	const getPerformanceColor = (value: string): string => {
		const numericValue = parseFloat(value.replace(',', '.'))
		if (numericValue < 0) return 'text-[var(--color-orange-sapians-500)]'
		if (value === '0,0%' || value === '- €') return 'text-muted-foreground'
		return 'text-[var(--color-green-sapians-500)]'
	}

	const defaultFormatter = (value: string, fund: FundData, column: ColumnConfig) => {
		if (column.dataKey === 'performance' || column.dataKey === 'performanceEur') {
			return (
				<span className={`font-medium ${getPerformanceColor(value)}`}>
					{value}
				</span>
			)
		}
		return value
	}

	return (
		<div ref={tableContainerRef} className="w-full h-full">
			<Table className="table-fixed w-full h-full border border-border bg-card shadow-md">
				<TableHeader className="bg-dark text-base">
					<TableRow className="border-b border-border hover:bg-transparent" style={{ height: `${headerHeight}px` }}>
						{columns.map((column) => (
							<TableHead 
								key={column.key}
								className={`font-semibold text-foreground-dark px-6 py-6 ${
									column.align === 'center' ? 'text-center' : 'text-left'
								}`}
							>
								{column.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="text-base">
					{fundData.map((fund, index) => (
						<TableRow 
							key={fund.name}
							className={`
								transition-colors hover:bg-[var(--color-grey-sapians-300)]/50
								${index % 2 === 0 ? 'bg-[var(--color-grey-sapians-100)]' : 'bg-[var(--color-grey-sapians-200)]'}
								${index === fundData.length - 1 ? '' : 'border-b border-border'}
							`}
							style={{ height: `${bodyRowHeight}px` }}
						>
							{columns.map((column, columnIndex) => {
								const value = fund[column.dataKey] as string
								const content = column.formatter 
									? column.formatter(value, fund) 
									: defaultFormatter(value, fund, column)
								
								return (
									<TableCell 
										key={column.key}
										className={`
											px-6 ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden
											${column.align === 'center' ? 'text-center' : ''}
											${columnIndex === 0 ? 'font-medium text-card-foreground' : 
											  columnIndex === 1 ? 'text-muted-foreground' : 
											  'font-medium text-card-foreground'}
										`}
									>
										<div className="truncate">
											{content}
										</div>
									</TableCell>
								)
							})}
						</TableRow>
					))}
				</TableBody>
				<TableFooter className="bg-[var(--color-gray-sapians-700)]">
					<TableRow className="bg-[var(--color-gray-sapians-700)] hover:bg-[var(--color-grey-sapians-300)]/50" style={{ height: `${footerHeight}px` }}>
						{columns.map((column, index) => {
							if (index === 0) {
								return (
									<TableCell key={column.key} className="px-6 py-6 font-bold text-card-foreground text-lg">
										Total
									</TableCell>
								)
							}
							
							if (column.footerValue && totalData) {
								const value = column.footerValue(totalData)
								const content = column.footerFormatter 
									? column.footerFormatter(value, totalData)
									: value
								
								return (
									<TableCell key={column.key} className="px-6 py-6 text-center">
										<span className={`font-bold text-lg ${
											column.dataKey === 'performance' || column.dataKey === 'performanceEur' 
												? getPerformanceColor(value)
												: 'text-card-foreground'
										}`}>
											{content}
										</span>
									</TableCell>
								)
							}
							
							return <TableCell key={column.key} className="px-6 py-6"></TableCell>
						})}
					</TableRow>
				</TableFooter>
			</Table>
			{footerNote && (
				<p className='italic text-muted-foreground text-left text-sm mt-2'>
					{footerNote}
				</p>
			)}
		</div>
	)
} 