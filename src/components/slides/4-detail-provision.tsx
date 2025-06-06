'use client'

import { useState, useEffect } from 'react'
import TableDetail from '@/components/slides/blocks/table-detail'
import Footer from '@/components/ui/footer'
import type { TotalData, FundData } from '@/lib/types'
import { getTotalData, getFundsData } from '@/lib/data/provision-service'
import Corner from '@/components/corners/Corner'
import { ChartLegendContent, ChartTooltip, ChartTooltipContent } from '../ui/chart'
import { ChartLegend } from '../ui/chart'
import { Pie } from 'recharts'
import { Cell } from 'recharts'
import { ChartContainer } from '../ui/chart'
import { PieChart } from 'recharts'

interface AllocationData {
	name: string
	value: number
	color: string
}

// Strategy color mapping with proper color values
const strategyColors = {
	'Cash': '#3b82f6',        // Blue
	'Obligations': '#10b981', // Green  
	'Monétaire': '#f59e0b'    // Amber
} as const

export default function DetailProvision() {
	const [totalData, setTotalData] = useState<TotalData | null>(null)
	const [fundsData, setFundsData] = useState<FundData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			try {
				const [total, funds] = await Promise.all([
					getTotalData(),
					getFundsData()
				])
				setTotalData(total)
				setFundsData(funds)
			} catch (error) {
				console.error('Error loading data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [])

	// Transform funds data into allocation data for the chart
	const allocationData: AllocationData[] = fundsData.map((fund) => {
		// Extract numeric value from valuation string (e.g., "28 992 €" -> 28992)
		const numericValue = parseFloat(fund.valuation.replace(/[^\d,]/g, '').replace(',', '.'))
		
		return {
			name: fund.strategy,
			value: numericValue,
			color: strategyColors[fund.strategy as keyof typeof strategyColors] || '#6b7280'
		}
	})

	// Chart configuration
	const allocationConfig = {
		Cash: {
			label: 'Cash',
			color: '#3b82f6'
		},
		Obligations: {
			label: 'Obligations', 
			color: '#10b981'
		},
		Monétaire: {
			label: 'Monétaire',
			color: '#f59e0b'
		}
	}

	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 px-16 py-16 grid grid-cols-3 gap-16 min-h-0'>
				<div className='col-span-2 h-full flex flex-col min-h-0'>
					<div className='text-justify mb-8 flex-shrink-0'>
						<h1 className='text-5xl font-bold mb-6'>
							Détail de la poche&nbsp;
							<span className='text-current bg-primary'>long-terme provision</span>
						</h1>
						<p className='italic text-muted-foreground'>
							Performance depuis l'ouverture du contrat, à date du 04.02.2025
						</p>
					</div>
					<h3 className='text-2xl font-bold mb-8 flex-shrink-0'>
						Synthèse des positions
					</h3>
					<div className='flex-1 min-h-0'>
						<TableDetail />
					</div>
				</div>
				<div className='col-span-1 h-full flex flex-col min-h-0'>
					<div className='text-justify mb-8 bg-[var(--color-grey-sapians-100)] p-8 rounded-lg flex-shrink-0'>
						<h2 className='text-5xl font-bold text-center text-primary-foreground'>
							{isLoading ? (
								<span className='text-2xl'>Chargement...</span>
							) : totalData ? (
								totalData.total
							) : (
								<span className='text-2xl text-destructive'>Erreur</span>
							)}
						</h2>
					</div>
					<div className='relative w-full flex-1 min-h-0'>
						<Corner position='top-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='top-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<div className='h-full flex flex-col' style={{ marginTop: '1rem', marginBottom: '1rem', marginLeft: '0rem', marginRight: '0rem' }}>
							<h3 className='text-2xl text-center py-8 px-4 flex-shrink-0'>Allocation stratégique à date</h3>
							{!isLoading && allocationData.length > 0 && (
								<div className='flex-1 flex items-center justify-center min-h-0'>	
									<ChartContainer id='allocation' config={allocationConfig} className='w-full h-full'>
										<PieChart width={400} height={400}>
											<ChartTooltip content={<ChartTooltipContent />} />
											<Pie 
												data={allocationData}
												dataKey='value'
												nameKey='name'
												cx='50%' 
												cy='50%' 
												outerRadius='60%'
												label={({ name, percent }: { name: string; percent: number }) => `${name}\n${(percent * 100).toFixed(1)}%`}
												className='text-base font-medium'
												labelLine={false}
											>
												{allocationData.map((entry: AllocationData, index: number) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ChartContainer>
								</div>
							)}
							{isLoading && (
								<div className='flex-1 flex items-center justify-center min-h-0'>
									<span className='text-lg text-muted-foreground'>Chargement du graphique...</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}