import Corner from '@/components/corners/Corner' // Adjusted import path

export default function NewSlidePage() {
	return (
		<section className='relative min-h-screen bg-dark text-center text-foreground-dark flex flex-col items-center justify-center p-8'>
			{/* Container for corners and content */}
			<div className='relative w-full max-w-6xl mx-auto'>
				{/* Four corners */}
				<Corner position='top-left' offset='4rem' />
				<Corner position='top-right' offset='4rem' />
				<Corner position='bottom-left' offset='4rem' />
				<Corner position='bottom-right' offset='4rem' />

				{/* Slide content */}
				<div className='flex flex-col items-center px-32 py-32'> {/* Centering content with inner padding */}
					<h1 className='text-6xl mb-12 tracking-widest text-primary font-[700]'>sapians</h1>
					<h2 className='text-4xl mb-6 uppercase font-[600] text-background'>Relevé de portefeuille</h2>
					<h3 className='text-6xl mb-4 text-primary font-[600]'>
						Reporting Assurance Vie Wealins
					</h3>

					<div className='text-left text-background text-lg space-y-1 mt-8'> {/* Details section */}
						<p><span >Conseiller :</span></p>
						<p><span >Teneur de compte :</span> Quintet</p>
						<p><span >Assureur :</span> Wealins</p>
						<p><span >Numéro de compte :</span></p>
					</div>

					<p className='text-primary text-2xl mt-16'>Février 2025</p>
				</div>
			</div>
		</section>
	)
}