'use client'

import Corner from '@/components/corners/Corner'
import Footer from '@/components/ui/footer'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LabelList } from 'recharts'
import CustomPieLabel from '@/components/ui/custom-pie-label'
import type { SyntheseData } from '@/lib/data/slide-interfaces'

interface SyntheseProps {
	data: SyntheseData | null
}

export default function Synthese({ data }: SyntheseProps) {
	// Show loading state if no data
	if (!data) {
		return (
			<div className='w-screen h-screen overflow-hidden flex flex-col'>
				<div className='flex-1 flex items-center justify-center'>
					<div className='text-xl text-muted-foreground'>Chargement des données de synthèse...</div>
				</div>
				<Footer />
			</div>
		)
	}

	// Transform bucket data for the bar chart (matching original structure)
	const repartitionData = [
		{ 
			name: 'Répartition', 
			// Map bucket data to expected keys
			provision: data.repartitionParPoche.find(item => item.name.includes('CT') || item.name.includes('provision'))?.value || 0,
			liquide: data.repartitionParPoche.find(item => item.name.includes('LTL') || item.name.includes('liquide'))?.value || 0,
			illiquide: data.repartitionParPoche.find(item => item.name.includes('LTI') || item.name.includes('illiquide'))?.value || 0
		}
	]

	const repartitionConfig = {
		illiquide: { label: 'Long-terme illiquide', color: '#F4F3EE' },
		liquide: { label: 'Long-terme liquide', color: '#D8D8D8' },
		provision: { label: 'Long-terme provision', color: '#A1DFF0' },
	}

	// Use the allocation data directly from props with colors included
	const allocationData = data.allocationStrategique.map(item => ({
		key: item.name.toLowerCase().replace(/\s+/g, ''),
		name: item.name,
		value: item.percentage || 0,
		color: item.color  // Include the color in the data
	}))

	// Create dynamic config from the data colors
	const allocationConfig = data.allocationStrategique.reduce((config, item) => {
		const key = item.name.toLowerCase().replace(/\s+/g, '')
		config[key] = { label: item.name, color: item.color }
		return config
	}, {} as Record<string, { label: string; color: string }>)

	// Helper to format numeric values with correct typing
	function formatNumber(value: number): string {
		return value.toLocaleString() + ' €'
	}

	return (
        <div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 flex flex-col px-16 py-16 min-h-0'>
				<div className='text-justify mb-8 flex-shrink-0'>
					<h1 className='text-5xl font-bold mb-8'>
						Synthèse de votre contrat&nbsp;
							<span className='text-current bg-primary'>d'assurance vie luxembourgeoise </span>
					</h1>
					<h2 className='text-3xl font-semibold mb-4'>
						Estimation du portefeuille :&nbsp;
						<span className='text-current bg-primary'> {data.estimationFormatted} </span>
					</h2>
					<p className='italic text-muted-foreground'>Données du 04.02.2025</p>
				</div>
				<div className='flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-0'>
					{/* First chart block: Répartition par poche */}
					<div className='relative h-full flex flex-col'>
						<Corner position='top-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='top-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						{/* Content wrapper with padding */}
						<div className='relative p-10 h-full flex flex-col'>
							<h2 className='text-3xl text-center mb-4 flex-shrink-0'>Répartition par poche</h2>
							<div className='flex-1 flex items-center justify-center min-h-0'>
								<ChartContainer id='repartition' config={repartitionConfig} className='w-full h-full'>
									<BarChart
										data={repartitionData}
										layout='horizontal'
										margin={{ top: 40, right: 100, bottom: 25, left: 100 }}
										className='text-primary-foreground text-base'
									>
									<XAxis type='category' dataKey='name' hide />
									<YAxis type='number' hide domain={[0, 100]} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<ChartLegend
									  content={<ChartLegendContent className='flex-col items-start justify-start' />} 
									  layout='vertical'
									  align='right'
									  verticalAlign='middle'
									/>
									<Bar 
										dataKey='illiquide' 
										stackId='repartition' 
										fill='var(--color-illiquide)'
									>
										<LabelList 
											dataKey='illiquide' 
											position='center' 
											formatter={formatNumber} 
											style={{ fontSize: 16, fill: 'var(--color-green-forest-sapians-500)' }}
										/>
									</Bar>
									<Bar
										dataKey='liquide'
										stackId='repartition' 
										fill='var(--color-liquide)'
									>
										<LabelList 
											dataKey='liquide' 
											position='center' 
											formatter={formatNumber} 
											style={{ fontSize: 16, fill: 'var(--color-green-forest-sapians-500)' }}
										/>
									</Bar>
									<Bar
										dataKey='provision' 
										stackId='repartition' 
										fill='var(--color-provision)'
									>
										<LabelList 
											dataKey='provision' 
											position='center' 
											formatter={formatNumber} 
											style={{ fontSize: 16, fill: 'var(--color-green-forest-sapians-500)' }}
										/>
									</Bar>
								</BarChart>
								</ChartContainer>
							</div>
						</div>
					</div>
					{/* Second chart block: Allocation stratégique */}
					<div className='relative h-full flex flex-col'>
						<Corner position='top-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='top-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						{/* Content wrapper with padding */}
						<div className='relative p-10 h-full flex flex-col'>
							<h3 className='text-3xl text-center mb-4 flex-shrink-0'>Allocation stratégique à date</h3>
							<div className='flex-1 flex items-center justify-center min-h-0'>
								<ChartContainer id='allocation' config={allocationConfig} className='w-full h-full'>
									<PieChart>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Pie 
											data={allocationData}
											dataKey='value'
											nameKey='name'
											cx='50%' 
											cy='50%' 
											outerRadius={160} 
											label={CustomPieLabel}
											labelLine={false}
										>
											<ChartLegend 
												content={<ChartLegendContent className='flex-col items-start justify-start' />} 
												layout='vertical'
												align='right'
												verticalAlign='middle'
											/>
											{allocationData.map((entry) => (
												<Cell key={entry.key} fill={entry.color} />
											))}
										</Pie>
									</PieChart>
								</ChartContainer>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
        </div>
	)
}