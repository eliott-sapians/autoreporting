'use client'

import PocheCard from '@/components/slides/blocks/poche-card'

export default function Zoom() {
	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col px-16 py-16'>
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
				<PocheCard
					chartData={[
						{ name: 'Provision', value: 200000, key: 'provision', color: 'var(--color-blue-atlante-sapians-500)' },
						{ name: 'Reserve', value: 100000, key: 'reserve', color: 'var(--color-blue-atlante-sapians-300)' },
					]}
					chartConfig={{}}
					name='POCHE LONG-TERME PROVISION'
					amount='300 000 €'
					amountRatio='(1,4%)'
					performanceLabel='PERFORMANCE'
					performanceValue='1,4%'
					mainBgClass='bg-[var(--color-blue-atlante-sapians-500)] font-bold text-white'
					amountBgClass='bg-[var(--color-blue-atlante-sapians-300)]'
					performanceTextClass='text-[var(--color-blue-atlante-sapians-500)]'
					performanceBgClass='bg-[var(--color-blue-atlante-sapians-100)]'
					cornerColor='var(--color-blue-atlante-sapians-500)'
				/>
				<PocheCard
					chartData={[
						{ name: 'Cash', value: 200000, key: 'cash', color: 'var(--color-green-sapians-500)' },
						{ name: 'Short-term Bonds', value: 100000, key: 'bonds', color: 'var(--color-green-sapians-300)' },
					]}
					chartConfig={{}}
					name='POCHE LONG-TERME LIQUIDE'
					amount='300 000 €'
					amountRatio='(1,4%)'
					performanceLabel='PERFORMANCE'
					performanceValue='1,4%'
					mainBgClass='bg-[var(--color-green-sapians-500)] font-bold text-white'
					amountBgClass='bg-[var(--color-green-sapians-300)]'
					performanceTextClass='text-[var(--color-green-sapians-500)]'
					performanceBgClass='bg-[var(--color-green-sapians-100)]'
					cornerColor='var(--color-green-sapians-500)'
				/>
				<PocheCard
					chartData={[
						{ name: 'Private Equity', value: 200000, key: 'pe', color: 'var(--color-grey-sapians-900)' },
						{ name: 'Real Estate', value: 100000, key: 'real-estate', color: 'var(--color-grey-sapians-700)' },
					]}
					chartConfig={{}}
					name='POCHE LONG-TERME ILLIQUIDE'
					amount='300 000 €'
					amountRatio='(1,4%)'
					performanceLabel='PERFORMANCE'
					performanceValue='1,4%'
					mainBgClass='bg-[var(--color-grey-sapians-900)] font-bold text-white'
					amountBgClass='bg-[var(--color-grey-sapians-700)]'
					performanceTextClass='text-[var(--color-grey-sapians-900)]'
					performanceBgClass='bg-[var(--color-grey-sapians-500)]'
					cornerColor='var(--color-grey-sapians-900)'
				/>
			</div>
		</div>
	)
}
