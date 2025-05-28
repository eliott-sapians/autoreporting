'use client'

import { useState, useEffect } from 'react'
import TableDetail from '@/components/table-detail'
import type { TotalData } from '@/lib/types'
import { getTotalData } from '@/lib/data/provision-service'
import Corner from '@/components/corners/Corner'
export default function DetailProvision() {
	const [totalData, setTotalData] = useState<TotalData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function loadTotalData() {
			try {
				const data = await getTotalData()
				setTotalData(data)
			} catch (error) {
				console.error('Error loading total data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadTotalData()
	}, [])

	return (
		<div className='w-full h-full px-16 py-16 grid grid-cols-3 gap-16'>
			<div className='col-span-2'>
				<div className='text-justify mb-16'>
					<h1 className='text-5xl font-bold mb-6'>
						Détail de la poche&nbsp;
						<span className='text-current bg-primary'>long-terme provision</span>
					</h1>
					<p className='italic text-muted-foreground'>
						Performance depuis l'ouverture du contrat, à date du 04.02.2025
					</p>
				</div>
				<h3 className='text-2xl font-bold mb-8'>
					Synthèse des positions
				</h3>
				<TableDetail />
			</div>
			<div className='col-span-1'>
				<div className='text-justify mb-8 bg-[var(--color-grey-sapians-100)] p-8 rounded-lg'>
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
				<div className='relative w-full h-full'>
					<Corner position='top-left' offset='1rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
					<Corner position='top-right' offset='1rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
					<Corner position='bottom-left' offset='1rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
					<Corner position='bottom-right' offset='1rem' length='2.5rem' thickness='0.8rem' color='var(--color-grey-sapians-300)'/>
				</div>
			</div>
		</div>
	)
}