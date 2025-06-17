import Corner from '@/components/corners/Corner'

export default function Merci() {

	return (
		<section className='relative min-h-screen bg-dark text-center text-foreground-dark flex flex-col items-center justify-center p-8'>
			{/* Container for corners and content */}
			<div className='relative w-full max-w-6xl mx-auto aspect-video'>
				{/* Four corners */} 
				<Corner position='top-left' offset='1rem' />
				<Corner position='top-right' offset='1rem' />
				<Corner position='bottom-left' offset='1rem' />
				<Corner position='bottom-right' offset='1rem' />

				{/* Slide content */}
				<div className='flex flex-col  px-16 py-16 h-full items-center justify-center'> {/* Centering content with inner padding */}
					<h1 className='text-8xl mb-12 tracking-widest text-primary font-[700]'>Merci</h1>
				</div>
			</div>
		</section>
	)
}