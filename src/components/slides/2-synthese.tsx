'use client'

import Corner from '@/components/corners/Corner'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LabelList } from 'recharts'

export default function Synthese() {
	const repartitionData = [
		{ name: 'Répartition', illiquide: 404000, liquide: 500000, provision: 200000 }
	]
	const repartitionConfig = {
		illiquide: { label: 'Long-terme illiquide', color: '#F4F3EE' },
		liquide: { label: 'Long-terme liquide', color: '#D8D8D8' },
		provision: { label: 'Long-terme provision', color: '#A1DFF0' },
	}

	const allocationData = [
		{ key: 'dettesPrivees', name: 'Dette privée', value: 44 },
		{ key: 'monetaire', name: 'Monétaire', value: 22.6 },
		{ key: 'etfActions', name: 'ETF Actions', value: 6.2 },
		{ key: 'produitsStructures', name: 'Produits structurés', value: 7.1 },
		{ key: 'privateEquity', name: 'Private equity', value: 3.5 },
		{ key: 'obligations', name: 'Obligations', value: 13.0 },
		{ key: 'cash', name: 'Cash', value: 3.4 },
	]
	const allocationConfig = {
		dettesPrivees: { label: 'Dette privée', color: '#D64900' },
		monetaire: { label: 'Monétaire', color: '#005C8A' },
		etfActions: { label: 'ETF Actions', color: '#63B99C' },
		produitsStructures: { label: 'Produits structurés', color: '#2F8F79' },
		privateEquity: { label: 'Private equity', color: '#F37733' },
		obligations: { label: 'Obligations', color: '#C896DD' },
		cash: { label: 'Cash', color: '#BCB299' },
	}

	// Helper to format numeric values with correct typing
	function formatNumber(value: number): string {
		return value.toLocaleString() + ' €'
	}
	return (
        <div className='w-full px-16 py-16'>
            <div className='text-justify mb-16'>
                <h1 className='text-5xl font-bold mb-8'>
                    Synthèse de votre contrat&nbsp;
                        <span className='text-current bg-primary'>d'assurance vie luxembourgeoise </span>
                </h1>
                <h2 className='text-3xl font-semibold mb-4'>
                    Estimation du portefeuille :&nbsp;
                    <span className='text-current bg-primary'> 849 081 € </span>
                </h2>
                <p className='italic text-muted-foreground'>Données du 04.02.2025</p>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 h-full'>
                {/* First chart block: Répartition par poche */}
                <div className='relative'>
                    <Corner position='top-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='top-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='bottom-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='bottom-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    {/* Content wrapper with padding */}
                    <div className='relative p-10'>
                        <h2 className='text-3xl text-center mb-4'>Répartition par poche</h2>
                            <ChartContainer id='repartition' config={repartitionConfig} className='w-full'>
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
                {/* Second chart block: Allocation stratégique */}
                <div className='relative'>
                    <Corner position='top-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='top-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='bottom-left' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    <Corner position='bottom-right' offset='0.5rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
                    {/* Content wrapper with padding */}
                    <div className='relative p-10'>
                        <h3 className='text-3xl text-center mb-4'>Allocation stratégique à date</h3>
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
                                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    className='text-base'
                                    labelLine={false}
                                >
                                    <ChartLegend 
                                        content={<ChartLegendContent className='flex-col items-start justify-start' />} 
                                        layout='vertical'
                                        align='right'
                                        verticalAlign='middle'
                                    />
                                    {allocationData.map((entry) => (
                                        <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>
            </div>
        </div>
	)
}