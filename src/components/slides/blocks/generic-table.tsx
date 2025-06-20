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
	width?: string
}

interface GenericTableProps {
	columns: ColumnConfig[]
	footerNote?: string | ((data: BucketDetailData) => string)
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
	
	// Include an estimated footer note height if it exists
	const resolvedFooterNote = typeof footerNote === 'function' ? footerNote(data) : footerNote
	const footerNoteHeight = resolvedFooterNote ? 32 : 0 // Roughly 2rem
	// Calculate if we need to compress rows
	const naturalTableHeight = headerHeight + (fundData.length * naturalBodyRowHeight) + footerHeight + footerNoteHeight
	const needsCompression = naturalTableHeight > tableHeight
	
	// Calculate actual row height
	const bodyRowHeight = needsCompression 
		? Math.max(48, (tableHeight - headerHeight - footerHeight - footerNoteHeight) / fundData.length) // Minimum 48px per row
		: naturalBodyRowHeight

	const getPerformanceColor = (value: string): string => {
		const numericValue = parseFloat(value.replace(/[€%\s,]/g, '').replace(',', '.'))
		if (numericValue < 0) return 'text-[var(--color-orange-sapians-500)]'
		if (numericValue === 0) return 'text-muted-foreground'
		return 'text-[var(--color-green-sapians-500)]'
	}

	// SAP-65: Ensure consistent formatting for performance values (EUR & %) with a leading '+' on positives
	const formatPerformance = (value: number | string, isPercent: boolean): string => {
		if (value === null || value === undefined || value === '') return ''

		// Extract numeric value regardless of input type
		const numeric = typeof value === 'number'
			? value
			: parseFloat(String(value).replace(/[€%\s,]/g, '').replace(',', '.'))

		if (isNaN(numeric)) return String(value)

		const prefix = numeric > 0 ? '+' : ''
		return isPercent
			? `${prefix}${numeric.toFixed(1)}%`
			: `${prefix}${numeric.toLocaleString()} €`
	}

	const defaultFormatter = (value: any, fund: BucketDetailData['fundsTable'][0], column: ColumnConfig) => {
		// Dedicated handling for performance columns
		if (column.dataKey === 'performancePercent' || column.dataKey === 'performanceEur') {
			const displayValue = formatPerformance(value, column.dataKey === 'performancePercent')
			return (
				<span className={`font-medium ${getPerformanceColor(displayValue)}`}>
					{displayValue}
				</span>
			)
		}

		// Handle other data types
		let displayValue: string
		if (column.dataKey === 'engagement') {
			displayValue = typeof value === 'number' ? `${value.toLocaleString()} €` : String(value || '0 €')
		} else if (column.dataKey === 'appele') {
			displayValue = typeof value === 'number' ? `${value.toFixed(1)}%` : String(value || '0.0%')
		} else if (column.dataKey === 'tvpi') {
			// Format TVPI with two decimals and apply color coding
			const numericTvpi = typeof value === 'number' 
				? value 
				: parseFloat(String(value).replace(',', '.').replace(/[^0-9.\-]/g, ''))
			const colorClass = numericTvpi < 1
				? 'text-[var(--color-orange-sapians-500)]'
				: numericTvpi === 1
					? 'text-muted-foreground'
					: 'text-[var(--color-green-sapians-500)]'

			displayValue = numericTvpi.toFixed(2)
			return (
				<span className={`font-medium ${colorClass}`}>
					{displayValue}
				</span>
			)
		} else if (column.dataKey === 'valorisation') {
			displayValue = typeof value === 'number' ? `${value.toLocaleString()} €` : String(value || '')
		} else {
			displayValue = typeof value === 'number' ? value.toLocaleString() : String(value || '')
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
								} ${column.width || ''}`}
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
											${column.width || ''}
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
				<TableFooter className="bg-[var(--color-grey-sapians-300)]">
					<TableRow className="bg-[var(--color-grey-sapians-300)] hover:bg-[var(--color-grey-sapians-300)]/50" style={{ height: `${footerHeight}px` }}>
						{columns.map((column, index) => {
							if (index === 0) {
								return (
									<TableCell key={column.key} className="px-6 py-6 font-bold text-card-foreground text-lg">
										Total
									</TableCell>
								)
							}
							
							if (column.footerValue) {
								const rawValue = column.footerValue(data)
								
								// Apply default formatting when no custom footerFormatter is provided
								const formattedValue = column.footerFormatter
									? column.footerFormatter(rawValue, data)
									: (column.dataKey === 'performancePercent' || column.dataKey === 'performanceEur')
										? formatPerformance(rawValue, column.dataKey === 'performancePercent')
										: rawValue

								return (
									<TableCell key={column.key} className={`px-6 py-6 text-center ${column.width || ''}`}>
										<span className={`font-bold text-lg ${
											column.dataKey === 'performancePercent' || column.dataKey === 'performanceEur'
												? getPerformanceColor(String(formattedValue))
											: column.dataKey === 'tvpi'
												? (() => {
													const numericTvpi = parseFloat(String(formattedValue).replace(',', '.').replace(/[^0-9.\-]/g, ''))
													return numericTvpi < 1
														? 'text-[var(--color-orange-sapians-500)]'
														: numericTvpi === 1
															? 'text-muted-foreground'
															: 'text-[var(--color-green-sapians-500)]'
												})()
											: 'text-card-foreground'
										}`}>
											{formattedValue}
										</span>
									</TableCell>
								)
							} else {
								return (
									<TableCell key={column.key} className={`px-6 py-6 ${column.width || ''}`}>
									</TableCell>
								)
							}
						})}
					</TableRow>
				</TableFooter>
			</Table>
			{resolvedFooterNote && (
				<p className="mt-2 text-xs text-muted-foreground italic">
					{resolvedFooterNote}
				</p>
			)}
		</div>
	)
} 