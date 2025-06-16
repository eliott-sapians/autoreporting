'use client'

import PocheCard from '@/components/slides/blocks/poche-card'
import Footer from '@/components/ui/footer'
import type { ZoomData } from '@/lib/data/slide-interfaces'

interface ZoomProps {
	data: ZoomData | null
}

export default function Zoom({ data }: ZoomProps) {
	// Show loading state if no data
	if (!data) {
		return (
			<div className='w-screen h-screen overflow-hidden flex flex-col'>
				<div className='flex-1 flex items-center justify-center'>
					<div className='text-xl text-muted-foreground'>Chargement des données zoom...</div>
				</div>
				<Footer />
			</div>
		)
	}

	// Color mappings for each bucket type
	const bucketColors = {
		CT: {
			main: 'var(--color-blue-atlante-sapians-500)', // blue-500
			secondary: 'var(--color-blue-atlante-sapians-300)', // blue-300
			light: 'var(--color-blue-atlante-sapians-100)', // blue-100
		},
		LTL: {
			main: 'var(--color-green-sapians-500)', // emerald-500
			secondary: 'var(--color-green-sapians-300)', // emerald-300
			light: 'var(--color-green-sapians-100)', // emerald-100
		},
		LTI: {
			main: 'var(--color-grey-sapians-900)', // gray-700
			secondary: 'var(--color-grey-sapians-700)', // gray-400
			light: 'var(--color-grey-sapians-500)', // gray-100
		}
	}

	// Ensure buckets are ordered: CT, LTL, LTI
	const orderedBuckets = [...data.buckets].sort((a, b) => {
		const order = { CT: 1, LTL: 2, LTI: 3 }
		return (order[a.bucketCode as keyof typeof order] || 4) - (order[b.bucketCode as keyof typeof order] || 4)
	})

	// Create chart data for individual funds within each bucket
	const createBucketChartData = (bucket: any) => {
		const colors = [
			'var(--color-blue-atlante-sapians-500)',
			'var(--color-green-sapians-500)',
			'var(--color-grey-sapians-900)'
		]
		return bucket.funds.map((fund: any, index: number) => ({
			name: fund.name,
			value: fund.valuation,
			key: fund.name.toLowerCase().replace(/\s+/g, '-'),
			color: colors[index % colors.length]
		}))
	}

	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 flex flex-col px-16 py-16 min-h-0'>
				<div className='text-justify mb-8 flex-shrink-0'>
					<h1 className='text-5xl font-bold mb-6'>
						Zoom sur vos&nbsp;
						<span className='text-current bg-primary'>différentes poches </span>
					</h1>
					<p className='italic text-muted-foreground'>
						Performance depuis l'ouverture du contrat, à date du 04.02.2025
					</p>
				</div>
				<div className='flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-0'>
					{orderedBuckets.map((bucket) => {
						const colors = bucketColors[bucket.bucketCode as keyof typeof bucketColors] || bucketColors.CT
						
						return (
							<PocheCard
								key={bucket.bucketCode}
								chartData={createBucketChartData(bucket)}
								chartConfig={{}}
								name={`POCHE ${bucket.bucketName.toUpperCase()}`}
								amount={bucket.totalFormatted}
								amountRatio={`(${bucket.percentageOfPortfolio.toFixed(1)}%)`}
								performanceLabel='PERFORMANCE'
								performanceValue={`${bucket.performancePercentage.toFixed(1)}%`}
								mainBgColor={colors.main}
								amountBgColor={colors.secondary}
								performanceTextColor={colors.main}
								performanceBgColor={colors.light}
								cornerColor={colors.main}
							/>
						)
					})}
				</div>
			</div>
			<Footer />
		</div>
	)
}
