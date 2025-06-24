'use client'

import Footer from '@/components/ui/footer'
import type { BucketDetailData } from '@/lib/data/slide-interfaces'
import Corner from '@/components/corners/Corner'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, Cell, PieChart, LabelList } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { customPieLabelFormatter } from '@/components/ui/custom-pie-label'
import { CustomizedLabel } from '@/components/ui/customized-pie-label'
import TableDetail from './table-detail'
import TableIlliquid from './table-illiquid'

export interface PageSection {
	type: 'remaining-deploy'
	content?: string
}

export interface DetailPageConfig {
	title: string
	titleHighlight: string
	sections?: PageSection[]
	tableComponent: string
	chartId: string
}

interface GenericDetailPageProps {
	config: DetailPageConfig
	data: BucketDetailData | null
}

export default function GenericDetailPage({ config, data }: GenericDetailPageProps) {
	// Show loading state if no data
	if (!data) {
		return (
			<div className='w-screen h-screen overflow-hidden flex flex-col'>
				<div className='flex-1 flex items-center justify-center'>
					<div className='text-xl text-muted-foreground'>Chargement des données détaillées...</div>
				</div>
				<Footer />
			</div>
		)
	}

	// Resolve table component from string identifier
	const getTableComponent = (componentName: string) => {
		switch (componentName) {
			case 'TableDetail':
				return TableDetail
			case 'TableIlliquid':
				return TableIlliquid
			default:
				return TableDetail
		}
	}

	const TableComponent = getTableComponent(config.tableComponent)

	// Chart configuration based on fund colors
	const allocationConfig = data.fundsChart.reduce((config, item) => {
		const key = item.name.toLowerCase().replace(/\s+/g, '')
		config[key] = { label: item.name, color: item.color }
		return config
	}, {} as Record<string, { label: string; color: string }>)

	const renderRemainingDeploy = () => (
		<div>
			<p className='text-sm font-semibold text-center text-primary-foreground mt-2'>
				Restant à déployer : {data.restantADeployer ? `${data.restantADeployer.toLocaleString()} €` : 'N/A'}
			</p>
		</div>
	)

	const hasRemainingDeploy = config.sections?.some(s => s.type === 'remaining-deploy')

	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 px-16 py-16 grid grid-cols-3 gap-16 min-h-0'>
				<div className='col-span-2 h-full flex flex-col min-h-0'>
					<div className='text-justify flex-shrink-0 mb-24'>
						<h1 className='text-5xl font-bold mb-6'>
							{config.title}&nbsp;
							<span className='text-current bg-primary'>{config.titleHighlight}</span>
						</h1>
					</div>
					<h3 className='text-2xl font-bold mb-8 flex-shrink-0'>
						Synthèse des positions
					</h3>
					<div className='flex-1 min-h-0'>
						<TableComponent data={data} />
					</div>
				</div>
				<div className='col-span-1 h-full flex flex-col min-h-0'>
					<div className='text-justify mb-8 bg-[var(--color-grey-sapians-100)] p-6 rounded-lg flex-shrink-0'>
						<h2 className='text-3xl font-bold text-center text-primary-foreground'>
							{data.bucketInfo.totalFormatted}
						</h2>
						{hasRemainingDeploy && (
							<>
								{renderRemainingDeploy()}
							</>
						)}
					</div>
					<div className={`relative w-full flex-1 min-h-0 ${hasRemainingDeploy ? 'flex flex-col' : ''}`}>
						<Corner position='top-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='top-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<div className={`${hasRemainingDeploy ? 'flex-1 flex flex-col' : 'h-full flex flex-col'}`} 
							 style={{ marginTop: '1rem', marginBottom: hasRemainingDeploy ? '0rem' : '1rem', marginLeft: '0rem', marginRight: '0rem' }}>
							<h3 className='text-2xl text-center py-8 px-4 flex-shrink-0'>Répartition par fonds</h3>
							{data.fundsChart.length > 0 && (
								<div className='flex-1 flex items-center justify-center min-h-0'>	
									<ChartContainer id={config.chartId} config={allocationConfig} className='w-full h-full'>
										<PieChart width={400} height={400}>
											<ChartTooltip content={<ChartTooltipContent />} />
											<Pie 
												data={data.fundsChart}
												dataKey='value'
												nameKey='name'
												cx='50%' 
												cy='50%' 
												outerRadius={125}
												labelLine={true}
												isAnimationActive={false}
												stroke='#FFFFFF'
												strokeWidth={2}
												label={<CustomizedLabel />}
											>
												{data.fundsChart.map((entry, index: number) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ChartContainer>
								</div>
							)}
						</div>

						<Corner position='bottom-left' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
						<Corner position='bottom-right' offset='0rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
} 