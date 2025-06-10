'use client'

import Corner from '../../corners/Corner'
import CompositionPieChart from './composition-pie-chart'
import { ChartConfig } from '../../ui/chart'

interface ChartDataItem {
	name: string
	value: number
	key: string
	color: string
}

interface PocheCardProps {
	name: string
	amount: string
	amountRatio?: string
	performanceLabel: string
	performanceValue: string
	chartData: ChartDataItem[]
	chartConfig: ChartConfig
	mainBgColor: string
	amountBgColor: string
	performanceTextColor: string
	performanceBgColor: string
	cornerColor?: string
}

export default function PocheCard({
	name,
	amount,
	amountRatio,
	performanceLabel,
	performanceValue,
	chartData,
	chartConfig,
	mainBgColor,
	amountBgColor,
	performanceTextColor,
	performanceBgColor,
	cornerColor,
}: PocheCardProps) {
	return (
		<div className='h-full flex flex-col'>
			<div className='flex-shrink-0'>
				<div className='grid grid-cols-4'>
					<div className='col-span-3 grid grid-cols-4 grid-rows-4 font-bold text-white' style={{ backgroundColor: mainBgColor }}>
						<div className='col-span-4 row-span-2 flex items-center pl-4'>
							<p className='text-lg font-bold'>{name}</p>
						</div>
						<div className='col-span-3 row-span-2 grid grid-cols-2 flex items-center pl-4' style={{ backgroundColor: amountBgColor }}>
							<p>{amount}</p>
							{amountRatio && <p className='flex justify-end pr-4'>{amountRatio}</p>}
						</div>
					</div>
					<div className='col-span-1 grid grid-rows-4'>
						<div className='row-span-1 flex items-center justify-center' style={{ color: performanceTextColor }}>
							<p className='text-sm'>{performanceLabel}</p>
						</div>
						<div className='row-span-3 flex items-center justify-center' style={{ backgroundColor: performanceBgColor }}>
							<p className='text-lg'>{performanceValue}</p>
						</div>
					</div>
				</div>
			</div>
			
			<div className='flex-1 flex flex-col justify-between min-h-0'>
				<div className='flex-shrink-0 mt-8'>
					<h3 className='text-xl text-center mb-4'>Composition de la poche</h3>
				</div>
				<CompositionPieChart chartConfig={chartConfig} chartData={chartData} />
				<div className='relative flex-shrink-0 h-8'>
					<Corner position='bottom-left' offset='0.5rem' length='1.5rem' thickness='0.5rem' color={cornerColor}/>
					<Corner position='bottom-right' offset='0.5rem' length='1.5rem' thickness='0.5rem' color={cornerColor}/>
				</div>
			</div>
		</div>
	)
}