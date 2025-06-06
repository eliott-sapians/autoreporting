'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/ui/footer'
import type { TotalData, FundData } from '@/lib/types'
import Corner from '@/components/corners/Corner'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, Cell, PieChart } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

interface AllocationData {
	name: string
	value: number
	color: string
}

export interface PageSection {
	type: 'subtitle' | 'remaining-deploy'
	content?: string
}

export interface DetailPageConfig {
	title: string
	titleHighlight: string
	sections?: PageSection[]
	tableComponent: React.ComponentType
	chartId: string
}

interface GenericDetailPageProps {
	config: DetailPageConfig
}

// Strategy color mapping
const strategyColors = {
	'Cash': '#3b82f6',
	'Obligations': '#10b981',
	'Monétaire': '#f59e0b'
} as const

// Mock data (to be replaced by new architecture)
const mockTotalData: TotalData = { 
	total: '849 081 €',
	performance: '+5.2%',
	performanceEur: '+42 420 €'
}
const mockFundsData: FundData[] = [
	{ 
		name: 'Cash Fund',
		strategy: 'Cash', 
		valuation: '300 000 €',
		performance: '+2.1%',
		performanceEur: '+6 300 €'
	},
	{ 
		name: 'Obligations Fund',
		strategy: 'Obligations', 
		valuation: '400 000 €',
		performance: '+3.8%',
		performanceEur: '+15 200 €'
	},
	{ 
		name: 'Monétaire Fund',
		strategy: 'Monétaire', 
		valuation: '149 081 €',
		performance: '+8.2%',
		performanceEur: '+12 224 €'
	}
]

export default function GenericDetailPage({ config }: GenericDetailPageProps) {
	const [totalData, setTotalData] = useState<TotalData | null>(null)
	const [fundsData, setFundsData] = useState<FundData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Simulate data loading
		const loadData = async () => {
			await new Promise(resolve => setTimeout(resolve, 500))
			setTotalData(mockTotalData)
			setFundsData(mockFundsData)
			setIsLoading(false)
		}
		loadData()
	}, [])

	// Transform funds data into allocation data for the chart
	const allocationData: AllocationData[] = fundsData.map((fund) => {
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

	const renderSubtitle = (section: PageSection) => (
		<p className='italic text-muted-foreground'>
			{section.content}
		</p>
	)

	const renderRemainingDeploy = () => (
		<div className='bg-[var(--color-grey-sapians-100)] p-4 mx-8 mb-8 rounded-lg flex-shrink-0'>
			<h4 className='text-lg font-semibold text-center text-primary-foreground mb-2'>
				Restant à déployer
			</h4>
			<p className='text-3xl font-bold text-center text-primary-foreground'>
				{isLoading ? (
					<span className='text-lg'>Chargement...</span>
				) : (
					'€ XXX XXX'
				)}
			</p>
		</div>
	)

	const hasRemainingDeploy = config.sections?.some(s => s.type === 'remaining-deploy')

	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 px-16 py-16 grid grid-cols-3 gap-16 min-h-0'>
				<div className='col-span-2 h-full flex flex-col min-h-0'>
					<div className={`text-justify flex-shrink-0 ${config.sections?.some(s => s.type === 'subtitle') ? 'mb-8' : 'mb-24'}`}>
						<h1 className='text-5xl font-bold mb-6'>
							{config.title}&nbsp;
							<span className='text-current bg-primary'>{config.titleHighlight}</span>
						</h1>
						{config.sections?.map((section, index) => {
							if (section.type === 'subtitle') {
								return <div key={index}>{renderSubtitle(section)}</div>
							}
							return null
						})}
					</div>
					<h3 className='text-2xl font-bold mb-8 flex-shrink-0'>
						Synthèse des positions
					</h3>
					<div className='flex-1 min-h-0'>
						<config.tableComponent />
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
					<div className={`relative w-full flex-1 min-h-0 ${hasRemainingDeploy ? 'flex flex-col' : ''}`}>
						<Corner position='top-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='top-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						{!hasRemainingDeploy && (
							<>
								<Corner position='bottom-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
								<Corner position='bottom-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
							</>
						)}
						<div className={`${hasRemainingDeploy ? 'flex-1 flex flex-col' : 'h-full flex flex-col'}`} 
							 style={{ marginTop: '1rem', marginBottom: hasRemainingDeploy ? '0rem' : '1rem', marginLeft: '0rem', marginRight: '0rem' }}>
							<h3 className='text-2xl text-center py-8 px-4 flex-shrink-0'>Allocation stratégique à date</h3>
							{!isLoading && allocationData.length > 0 && (
								<div className='flex-1 flex items-center justify-center min-h-0'>	
									<ChartContainer id={config.chartId} config={allocationConfig} className='w-full h-full'>
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
						{config.sections?.map((section, index) => {
							if (section.type === 'remaining-deploy') {
								return <div key={index}>{renderRemainingDeploy()}</div>
							}
							return null
						})}
						{hasRemainingDeploy && (
							<>
								<Corner position='bottom-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
								<Corner position='bottom-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
							</>
						)}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
} 