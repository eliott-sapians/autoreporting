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
import type { BucketDetailData } from '@/lib/data/slide-interfaces'

interface ColumnConfig {
	key: string
	header: string
	align: 'left' | 'center'
	dataKey: keyof BucketDetailData['fundsTable'][0]
	formatter?: (value: any, fund: BucketDetailData['fundsTable'][0]) => React.ReactNode
	footerValue?: (data: BucketDetailData) => string
	footerFormatter?: (value: string, data: BucketDetailData) => React.ReactNode
}

interface GenericTableProps {
	columns: ColumnConfig[]
	footerNote?: string
	data: BucketDetailData
}

export default function GenericTable({ columns, footerNote, data }: GenericTableProps) {
	const [tableHeight, setTableHeight] = useState<number>(0)
	const tableContainerRef = useRef<HTMLDivElement>(null)

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

	const fundData = data.fundsTable

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

	const defaultFormatter = (value: any, fund: BucketDetailData['fundsTable'][0], column: ColumnConfig) => {
		// Handle different data types
		const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value || '')
		
		if (column.dataKey === 'performancePercent' || column.dataKey === 'performanceEur') {
			return (
				<span className={`font-medium ${getPerformanceColor(displayValue)}`}>
					{displayValue}
				</span>
			)
		}
		return displayValue
	}

	return (
		<div ref={tableContainerRef} className="w-full h-full">
			<Table className="table-fixed w-full h-full border border-border bg-card shadow-md">
				<TableHeader className="bg-dark text-base">
					<TableRow className="border-b border-border hover:bg-transparent" style={{ minHeight: `${headerHeight}px` }}>
						{columns.map((column) => (
							<TableHead 
								key={column.key}
								className={`font-semibold text-foreground-dark px-6 py-6 whitespace-normal break-words leading-tight ${
									column.align === 'center' ? 'text-center' : 'text-left'
								}`}
							>
								<div className="hyphens-auto">
									{column.header}
								</div>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="text-base">
					{fundData.map((fund, index) => (
						<TableRow 
							key={fund.libelle}
							className={`
								transition-colors hover:bg-[var(--color-grey-sapians-300)]/50
								${index % 2 === 0 ? 'bg-[var(--color-grey-sapians-100)]' : 'bg-[var(--color-grey-sapians-200)]'}
								${index === fundData.length - 1 ? '' : 'border-b border-border'}
							`}
							style={{ height: `${bodyRowHeight}px` }}
						>
							{columns.map((column, columnIndex) => {
								const value = fund[column.dataKey] as any
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
							
							if (column.footerValue) {
								const value = column.footerValue(data)
								const content = column.footerFormatter 
									? column.footerFormatter(value, data)
									: value
								
								return (
									<TableCell key={column.key} className="px-6 py-6 text-center">
										<span className={`font-bold text-lg ${
											column.dataKey === 'performancePercent' || column.dataKey === 'performanceEur' 
												? getPerformanceColor(value)
												: 'text-card-foreground'
										}`}>
											{content}
										</span>
									</TableCell>
								)
							} else {
								return (
									<TableCell key={column.key} className="px-6 py-6">
									</TableCell>
								)
							}
						})}
					</TableRow>
				</TableFooter>
			</Table>
			{footerNote && (
				<p className="mt-2 text-xs text-muted-foreground italic">
					{footerNote}
				</p>
			)}
		</div>
	)
} 