import Corner from '@/components/corners/Corner'
import type { GardeData } from '@/lib/data/slide-interfaces'

interface GardeProps {
	data: GardeData | null
}

export default function Garde({ data }: GardeProps) {
	// Show loading state if no data
	if (!data) {
		return (
			<section className='relative min-h-screen bg-dark text-center text-foreground-dark flex flex-col items-center justify-center p-8'>
				<div className='relative w-full max-w-6xl mx-auto'>
					<Corner position='top-left' offset='1rem' />
					<Corner position='top-right' offset='1rem' />
					<Corner position='bottom-left' offset='1rem' />
					<Corner position='bottom-right' offset='1rem' />
					<div className='flex flex-col items-center px-16 py-16'>
						<div className='text-xl text-muted-foreground'>Chargement...</div>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section className='relative min-h-screen bg-dark text-center text-foreground-dark flex flex-col items-center justify-center p-8'>
			{/* Container for corners and content */}
			<div className='relative w-full max-w-6xl mx-auto'>
				{/* Four corners */}
				<Corner position='top-left' offset='1rem' />
				<Corner position='top-right' offset='1rem' />
				<Corner position='bottom-left' offset='1rem' />
				<Corner position='bottom-right' offset='1rem' />

				{/* Slide content */}
				<div className='flex flex-col items-center px-16 py-16'> {/* Centering content with inner padding */}
					<h1 className='text-6xl mb-12 tracking-widest text-primary font-[700]'>sapians</h1>
					<h2 className='text-4xl mb-4 uppercase font-[600] text-background'>Relevé de portefeuille</h2>
					<h3 className='text-5xl mb-4 text-primary font-[600]'>
						Reporting Assurance Vie Wealins
					</h3>

					<div className='text-left text-background text-lg space-y-1 mt-16'> {/* Details section */}
						<p><span>Conseiller :</span> {data.conseiller}</p>
						<p><span>Teneur de compte :</span> {data.teneurDeCompte}</p>
						<p><span>Assureur :</span> {data.assureur}</p>
						<p><span>Numéro de compte :</span> {data.numeroDeCompte}</p>
					</div>

					<div className='text-primary text-4xl mt-24'>
						{data.dateExtraction}
					</div>
				</div>
			</div>
		</section>
	)
}