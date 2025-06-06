import Corner from '@/components/corners/Corner'
import Footer from '@/components/ui/footer'

export default function Methodology() {
	return (
		<div className='w-screen h-screen overflow-hidden flex flex-col'>
			<div className='flex-1 flex flex-col px-16 py-16 min-h-0'>
				<div className='text-justify mb-12 flex-shrink-0'>
					<h1 className='text-5xl font-bold mb-8'>
						Méthodologie Sapians : stratégie&nbsp;
						<span className='text-current bg-primary'>d'allocation par poches</span>
					</h1>
				</div>
				
				<div className='flex-1 flex flex-col justify-between min-h-0'>
					{/* Introduction text */}
					<div className='flex-shrink-0 mb-8'>
						<p className='text-lg mb-4'>
							La méthodologie d'allocation de Sapians est basée sur un principe de <span className='text-current bg-primary'>poches d'investissements</span>. <span className='text-current bg-primary'>L'allocation finale</span> est définie en fonction de votre appétence au risque, votre durée d'investissement et votre recherche de performance.
						</p>
						<p className='text-lg'>
							Le déploiement de l'allocation pourra prendre <span className='text-current bg-primary'>quelques années</span> pour atteindre son <span className='text-current bg-primary'>plein potentiel</span>.
						</p>
					</div>

					{/* Three pockets flow diagram */}
					<div className='flex-1 flex flex-col justify-center min-h-0'>
						{/* Flow arrows */}
						<div className='flex items-center justify-center mb-8'>
							<div className='flex items-center w-full max-w-6xl'>
								<div className='flex-1 bg-gradient-to-r from-green-200 via-green-300 to-green-400 text-center py-4 text-white font-bold text-xl relative'>
									POCHE COURT TERME LIQUIDE
									<div className='absolute right-0 top-0 w-0 h-0 border-t-[2.5rem] border-b-[2.5rem] border-l-[2rem] border-l-green-400 border-t-transparent border-b-transparent'></div>
								</div>
								<div className='flex-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-center py-4 text-white font-bold text-xl relative'>
									POCHE LONG TERME LIQUIDE
									<div className='absolute right-0 top-0 w-0 h-0 border-t-[2.5rem] border-b-[2.5rem] border-l-[2rem] border-l-green-600 border-t-transparent border-b-transparent'></div>
								</div>
								<div className='flex-1 bg-gradient-to-r from-green-600 to-green-800 text-center py-4 text-white font-bold text-xl'>
									POCHE LONG TERME ILLIQUIDE
								</div>
							</div>
						</div>

						{/* Strategy label */}
						<div className='text-center mb-8'>
							<div className='inline-block bg-yellow-200 px-8 py-2 text-lg font-bold'>
								STRATÉGIES
							</div>
						</div>

						{/* Three columns descriptions */}
						<div className='grid grid-cols-3 gap-8 flex-1'>
							{/* Short term liquid pocket */}
							<div className='flex flex-col'>
								<p className='text-sm mb-4'>
									La <strong>poche court-terme</strong> permet de <strong>gérer efficacement les flux d'investissements</strong> intervenant sur le contrat (investissement progressif en actions, antichambre, appels de fonds non cotés).
								</p>
								<p className='text-sm mb-4'>
									Essentiellement investie dans des <strong>actifs prudents et très liquides</strong>, cette poche ne détiendra que des positions sur des <strong>durées courtes</strong>.
								</p>
								<p className='text-sm'>
									L'objectif principal est de <strong>limiter l'impact de l'inflation</strong> sur les échéances de placement courtes.
								</p>
							</div>

							{/* Long term liquid pocket */}
							<div className='flex flex-col'>
								<p className='text-sm mb-4'>
									La <strong>poche long-terme liquide</strong> a vocation à <strong>faire fructifier le capital à long-terme</strong> en investissant sur les marchés cotés.
								</p>
								<p className='text-sm mb-4'>
									Elle est <strong>déployée progressivement</strong> via un investissement régulier permettant de lisser les points d'entrée.
								</p>
								<p className='text-sm mb-4'>
									Une <strong>antichambre de 20% de la poche</strong> sera mise en réserve et déployée en cas de baisse importante des marchés action.
								</p>
								<p className='text-sm'>
									Les fonds seront essentiellement des <strong>ETF</strong>. L'analyse de la performance de la poche devrait pertinente au-delà de quelques années d'investissement.
								</p>
							</div>

							{/* Long term illiquid pocket */}
							<div className='flex flex-col'>
								<p className='text-sm mb-4'>
									La <strong>poche long-terme illiquide</strong> concentrera les <strong>investissements en fonds non cotés</strong>. L'absence de liquidité permettra de <strong>rechercher à long-terme un surplus de performance</strong>.
								</p>
								<p className='text-sm mb-4'>
									Les <strong>fonds sont appelés progressivement</strong> et les retours sur investissements se feront également petit à petit.
								</p>
								<p className='text-sm'>
									Les fonds non cotés mettent quelques années à se mettre en place et peuvent au départ présenter une performance négative (courbe en J). L'analyse de la performance interviendra au-delà de quelques années d'investissement.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
} 