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

export default function TableDetail() {
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
			<div ref={tableContainerRef} className="w-full h-full border border-border bg-card shadow-md overflow-hidden">
				<div className="p-6 text-center text-muted-foreground">
					Chargement des données...
				</div>
			</div>
		)
	}

	if (!totalData) {
		return (
			<div ref={tableContainerRef} className="w-full h-full border border-border bg-card shadow-md overflow-hidden">
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

	return (
		<div ref={tableContainerRef} className="w-full h-full">
			<Table className="table-fixed w-full h-full border border-border bg-card shadow-md">
				<TableHeader className="bg-dark text-base">
					<TableRow className="border-b border-border hover:bg-transparent" style={{ height: `${headerHeight}px` }}>
						<TableHead className="font-semibold text-foreground-dark px-6 py-6 text-left">
							LIBELLÉ DU FONDS
						</TableHead>
						<TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
							STRATÉGIE
						</TableHead>
						<TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
							VALORISATION
						</TableHead>
						<TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
							PERFORMANCE (%)
						</TableHead>
						<TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
							PERFORMANCE (EUR)
						</TableHead>
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
							<TableCell className={`px-6 font-medium text-card-foreground ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden`}>
								<div className="truncate">
									{fund.name}
								</div>
							</TableCell>
							<TableCell className={`px-6 text-center text-muted-foreground ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden`}>
								<div className="truncate">
									{fund.strategy}
								</div>
							</TableCell>
							<TableCell className={`px-6 text-center font-medium text-card-foreground ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden`}>
								<div className="truncate">
									{fund.valuation}
								</div>
							</TableCell>
							<TableCell className={`px-6 text-center ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden`}>
								<div className="truncate">
									<span className={`
										font-medium 
										${
											parseFloat(fund.performance.replace(',', '.')) < 0
												? 'text-[var(--color-orange-sapians-500)]'
												: fund.performance === '0,0%'
													? 'text-muted-foreground'
													: 'text-[var(--color-green-sapians-500)]'
										}
									`}>
										{fund.performance}
									</span>
								</div>
							</TableCell>
							<TableCell className={`px-6 text-center ${needsCompression ? 'py-2' : 'py-6'} overflow-hidden`}>
								<div className="truncate">
									<span className={`
										font-medium 
										${
											parseFloat(fund.performanceEur.replace(',', '.')) < 0
												? 'text-[var(--color-orange-sapians-500)]'
												: fund.performanceEur === '- €'
													? 'text-muted-foreground'
													: 'text-[var(--color-green-sapians-500)]'
										}
									`}>
										{fund.performanceEur}
									</span>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				<TableFooter className="bg-[var(--color-gray-sapians-700)]">
					<TableRow className="bg-[var(--color-gray-sapians-700)] hover:bg-[var(--color-grey-sapians-300)]/50" style={{ height: `${footerHeight}px` }}>
						<TableCell className="px-6 py-6 font-bold text-card-foreground text-lg">
							Total
						</TableCell>
						<TableCell className="px-6 py-6"></TableCell>
						<TableCell className="px-6 py-6 text-center font-bold text-card-foreground text-lg">
							{totalData.total}
						</TableCell>
						<TableCell className="px-6 py-6 text-center">
							<span className={`
								font-bold text-lg
								${
									parseFloat(totalData.performance.replace(',', '.')) < 0
										? 'text-[var(--color-orange-sapians-500)]'
										: totalData.performance === '0,0%'
											? 'text-muted-foreground'
											: 'text-[var(--color-green-sapians-500)]'
								}
							`}>
								{totalData.performance}
							</span>
						</TableCell>
						<TableCell className="px-6 py-6 text-center">
							<span className={`
								font-bold text-lg
								${
									parseFloat(totalData.performanceEur.replace(',', '.')) < 0
										? 'text-[var(--color-orange-sapians-500)]'
										: totalData.performanceEur === '- €'
											? 'text-muted-foreground'
											: 'text-[var(--color-green-sapians-500)]'
								}
							`}>
								{totalData.performanceEur}
							</span>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	)
}
