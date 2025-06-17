import Corner from '@/components/corners/Corner'
import Footer from '@/components/ui/footer'

export default function Methodology() {
	return (
		<section className='relative min-h-screen flex flex-col bg-background text-foreground'>
			{/* Content wrapper */}
			<div className='flex-1 flex flex-col px-16 py-16 min-h-0 w-full'>
				<header className='mb-12 text-justify'>
					<h1 className='text-5xl font-bold leading-tight'>
						Méthodologie Sapians : stratégie&nbsp;
						<span className='bg-primary text-current'>d'allocation par poches</span>
					</h1>
				</header>

				{/* Introductory paragraphs */}
				<div className='space-y-8 mb-16  mt-8 text-2xl text-justify'>
					<p>
						La méthodologie d'allocation de Sapians est basée sur un principe de
						<span className='bg-primary text-current'> poches d'investissements</span>.{' '}
						<span className='bg-primary text-current'>L'allocation finale</span> est définie en fonction de votre appétence au risque, votre durée d'investissement et votre recherche de performance.
					</p>
					<p>
						Le déploiement de l'allocation pourra prendre
						<span className='bg-primary text-current'> quelques années</span> pour atteindre son{' '}
						<span className='bg-primary text-current'>plein potentiel</span>.
					</p>
				</div>

				{/* Gradient bar for pockets */}
				<div className='w-full mb-8'>
					<div className='flex h-16 w-full overflow-hidden rounded-sm text-xl'>
						{/* Provision */}
						<div className='flex-1 flex py-4 items-center justify-center bg-[var(--color-green-forest-sapians-100)] text-white font-bold uppercase text-center'>
							POCHE LONG TERME PROVISION
						</div>
						{/* Liquide */}
						<div className='flex-1 flex py-4 items-center justify-center bg-[var(--color-green-forest-sapians-200)] text-white font-bold uppercase text-center'>
							POCHE LONG TERME LIQUIDE
						</div>
						{/* Illiquide */}
						<div className='flex-1 flex py-4 items-center justify-center bg-[var(--color-green-forest-sapians-300)] text-white font-bold uppercase text-center'>
							POCHE LONG TERME ILLIQUIDE
						</div>
					</div>
				</div>

				{/* Strategy details */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-lg flex-1'>
					{/* Provision column */}
					<div className='space-y-4 text-justify'>
						<p>
							La <strong>poche long terme provision</strong> permet de
							<strong> gérer efficacement les flux d'investissements</strong> intervenant sur le contrat (investissement progressif en actions, antichambre, appels de fonds non cotés).
						</p>
						<p>
							Essentiellement investie dans des <strong>actifs prudents et très liquides</strong>, cette poche ne détiendra que des positions sur des <strong>durées courtes</strong>.
						</p>
						<p>
							L'objectif principal est de <strong>limiter l'impact de l'inflation</strong> sur les échéances de placement courtes.
						</p>
					</div>

					{/* Liquide column */}
					<div className='space-y-4 text-justify'>
						<p>
							La <strong>poche long terme liquide</strong> a vocation à
							<strong> faire fructifier le capital à long terme</strong> en investissant sur les marchés cotés.
						</p>
						<p>
							Elle est <strong>déployée progressivement</strong> via un investissement régulier permettant de lisser les points d'entrée.
						</p>
						<p>
							Une <strong>antichambre de 20 % de la poche</strong> sera mise en réserve et déployée en cas de baisse importante des marchés action.
						</p>
						<p>
							Les fonds seront essentiellement des <strong>ETF</strong>. L'analyse de la performance de la poche devient pertinente au-delà de quelques années d'investissement.
						</p>
					</div>

					{/* Illiquide column */}
					<div className='space-y-4 text-justify'>
						<p>
							La <strong>poche long terme illiquide</strong> concentrera les <strong>investissements en fonds non cotés</strong>. L'absence de liquidité permettra de <strong>rechercher à long terme un surplus de performance</strong>.
						</p>
						<p>
							Les <strong>fonds sont appelés progressivement</strong> et les retours sur investissements se feront également petit à petit.
						</p>
						<p>
							Les fonds non cotés mettent quelques années à se mettre en place et peuvent au départ présenter une performance négative (courbe en J). L'analyse de la performance interviendra au-delà de quelques années d'investissement.
						</p>
					</div>
				</div>
			</div>

			<Footer />
		</section>
	)
} 